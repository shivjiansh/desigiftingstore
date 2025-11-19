import { adminDb } from '../../../lib/firebaseAdmin';
import admin from 'firebase-admin';
import { withAxiom } from "next-axiom";

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
   
    // Query all active products from Firestore
    const snapshot = await adminDb
      .collection("products")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    // Map Firestore documents to product objects
    const allProducts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString(),
      };
    });

    console.log("Products fetched successfully");

    // ✅ FIXED: Wrap response in same format as handleGetProducts
    const result = {
      results: allProducts, // ← Products array wrapped in "results"
      totalFound: allProducts.length, // ← Total count
      page: 1, // ← Page number (1 since we return all)
      limit: allProducts.length, // ← Limit equals total
      hasMore: false, // ← No more pages (returned all)
    };

    // Return success response with unified format
    return sendSuccess(res, result, "All products fetched successfully");
  } catch (error) {
console.log("Error fetching products");
    // Return error response
    return res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      details: error.message,
    });
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
    page = 1,
    limit = 20,
    orderBy = "createdAt",
    orderDirection = "desc",
  } = req.query;

  try {
    console.log("HHHHHHHHHHH");
    // Get single product by ID
    if (id) {
      const productDoc = await adminDb.collection("products").doc(id).get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      const productData = { id: productDoc.id, ...productDoc.data() };
      return sendSuccess(res, productData, "Product retrieved successfully");
    }

    // Build query - only filter by sellerId
    console.log("Building product query");
    console.log("Requested sellerId:", sellerId);

    let query = adminDb.collection("products");

    // ONLY filter by sellerId if provided
    if (sellerId) {
      console.log("Filtering by sellerId:", sellerId);
      query = query.where("sellerId", "==", sellerId);
    } else {
      console.log("⚠️ WARNING: No sellerId provided");
    }

    console.log("Query built successfully");

    // Apply ordering
    const validOrderFields = [
      "createdAt",
      "price",
      "name",
      "rating",
      "totalSales",
    ];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : "createdAt";
    const orderDir = orderDirection === "asc" ? "asc" : "desc";

    console.log("Ordering by:", orderField, orderDir);
    query = query.orderBy(orderField, orderDir);

    // Apply pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    if (pageNum > 1) {
      const offset = (pageNum - 1) * limitNum;
      query = query.offset(offset);
    }

    query = query.limit(limitNum);

    console.log("Executing query...");
    const snapshot = await query.get();

    console.log("Query returned", snapshot.size, "documents");

    const products = [];

    snapshot.forEach((doc) => {
      const productData = { id: doc.id, ...doc.data() };

      // Apply search filter on results
      if (search) {
        const searchTerm = search.toLowerCase();
        const matchesSearch =
          productData.name?.toLowerCase().includes(searchTerm) ||
          productData.description?.toLowerCase().includes(searchTerm) ||
          productData.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm)
          );

        if (matchesSearch) {
          products.push(productData);
        }
      } else {
        products.push(productData);
      }
    });

    console.log("Final product count:", products.length);

    const result = {
      results: products,
      totalFound: products.length,
      page: pageNum,
      limit: limitNum,
      hasMore: products.length === limitNum,
    };

    return sendSuccess(res, result, "Products retrieved successfully");
  } catch (error) {
    console.log("❌ ERROR in handleGetProducts:", error);
    console.log("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "Failed to retrieve products",
      details: error.message,
    });
  }
}

// POST /api/products - Create new product
async function handleCreateProduct(req, res) {
  try {
    const decoded = await verifyAuthToken(req);
    const body = req.body;

    if (!body.name ) {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }
 

    const now = new Date().toISOString();
    const newProduct = {
      ...body,
      sellerId: decoded.uid,
      price: parseFloat(body.price),
      stock: parseInt(body.stock) || 0,
      isActive: ["active", "fewleft", "inactive"].includes(body.status),
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