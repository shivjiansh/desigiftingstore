import { adminDb } from '../../../lib/firebaseAdmin';
import admin from 'firebase-admin';
import { 
  verifyAuthToken, 
  getUserRole,
  handleError, 
  sendSuccess, 
  validateRequiredFields, 
  sanitizeInput, 
  methodNotAllowed,
  getPaginatedResults 
} from '../utils';

export default async function handler(req, res) {
  const { method, query } = req;

  try {
    if (method === "GET" && query.all === "true") {
      await handleFetchAllProducts(req, res);
    } else {
      switch (method) {
        case "GET":
          await handleGetProducts(req, res);
          break;
        case "POST":
          await handleCreateProduct(req, res);
          break;
        default:
          methodNotAllowed(res, ["GET", "POST"]);
      }
    }
  } catch (error) {
    handleError(res, error);
  }
}

// GET /api/products/all - Return full array of all active products
async function handleFetchAllProducts(req, res) {
  console.log("Fetching all active products");
  try {
    const snapshot = await adminDb
      .collection("products")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    const allProducts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString(),
      };
    });
    console.log(`Fetched ${allProducts.length} active products`);

    return sendSuccess(res, allProducts, "All products fetched successfully");
  } catch (error) {
    console.error("Error fetching all products:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
}


// GET /api/products - Get products with filtering and pagination
async function handleGetProducts(req, res) {
  const { 
    id,
    sellerId,
    tags,
    minPrice,
    maxPrice,
    search,
    featured,
    isActive = 'true',
    page = 1,
    limit = 20,
    orderBy = 'createdAt',
    orderDirection = 'desc'
  } = req.query;

  // Get single product by ID
  if (id) {
    const productDoc = await adminDb.collection('products').doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const productData = { id: productDoc.id, ...productDoc.data() };

    // Check if product is active or user is the seller/admin
    if (!productData.isActive) {
      const decodedToken = await verifyAuthToken(req);
      const userRole = await getUserRole(decodedToken.uid);

      if (decodedToken.uid !== productData.sellerId && userRole !== 'admin') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
    }

    return sendSuccess(res, productData, 'Product retrieved successfully');
  }

  

  // Build filters for product search
  console.log("Building product query with filters");
  const filters = {};

  if (isActive !== 'all') {
    filters.isActive = isActive === 'true';
  }

  if (sellerId) {
    filters.sellerId = sellerId;
  }
  console.log("Filters so far:", filters);
  // For tag filtering, we'll need to use array-contains-any
  let query = adminDb.collection('products');

  // Apply basic filters
  Object.entries(filters).forEach(([field, value]) => {
    query = query.where(field, '==', value);
  });
  console.log("Query after basic filters:", query);

  // Apply tag filter if provided
 

  // Apply ordering
  const validOrderFields = ['createdAt', 'price', 'name', 'rating', 'totalSales'];
  const orderField = validOrderFields.includes(orderBy) ? orderBy : 'createdAt';
  const orderDir = orderDirection === 'asc' ? 'asc' : 'desc';

  query = query.orderBy(orderField, orderDir);

  console.log("Final query before pagination:", query);
  // Apply pagination
  if (page > 1) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.offset(offset);
  }

  query = query.limit(parseInt(limit));
  console.log("Query with pagination:", query);
  const snapshot = await query.get();
  const products = [];
  console.log("Processing query results");
  snapshot.forEach(doc => {
    const productData = { id: doc.id, ...doc.data() };
    console.log("Product found:", productData);

    // Apply search filter on results (since Firestore doesn't support full-text search)
    if (search) {
      const searchTerm = search.toLowerCase();
      const matchesSearch = 
        productData.name?.toLowerCase().includes(searchTerm) ||
        productData.description?.toLowerCase().includes(searchTerm) ||
        productData.tags?.some(tag => tag.toLowerCase().includes(searchTerm));

      if (matchesSearch) {
        products.push(productData);
      }
    } else {
      products.push(productData);
    }
  });

  const result = {
    results: products,
    totalFound: products.length,
    page: parseInt(page),
    limit: parseInt(limit),
    hasMore: products.length === parseInt(limit)
  };

  return sendSuccess(res, result, 'Products retrieved successfully');
}

// POST /api/products - Create new product
async function handleCreateProduct(req, res) {
  try {
    const decoded = await verifyAuthToken(req);
    const body = req.body;

    if (!body.name || !body.price) {
      return res
        .status(400)
        .json({ success: false, error: "Name and price are required" });
    }
    if (isNaN(body.price) || body.price <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Price must be a positive number" });
    }

    const now = new Date().toISOString();
    const newProduct = {
      ...body,
      sellerId: decoded.uid,
      price: parseFloat(body.price),
      stock: parseInt(body.stock) || 0,
      isActive: ["active", "fewleft"].includes(body.status),
      createdAt: now,
      updatedAt: now,
    };

    const ref = await adminDb.collection("products").add(newProduct);

    // Update seller stats
    try {
      await adminDb
        .collection("seller")
        .doc(decoded.uid)
        .update({
          "sellerStats.totalProducts": admin.firestore.FieldValue.increment(1),
          updatedAt: now,
        });
      console.log("Seller stats updated");
    } catch (err) {
      console.log("Error updating seller stats:", err.message);
    }

    const created = { id: ref.id, ...newProduct };
    return sendSuccess(res, created, "Product created successfully", 201);
  } catch (err) {
    console.error("Error creating product:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create product" });
  }
}