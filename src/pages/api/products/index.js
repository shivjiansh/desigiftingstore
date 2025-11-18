import { adminDb } from "../../../lib/firebaseAdmin";
import admin from "firebase-admin";
import { withAxiom } from "next-axiom";

import {
  verifyAuthToken,
  getUserRole,
  handleError,
  sendSuccess,
  validateRequiredFields,
  sanitizeInput,
  methodNotAllowed,
  getPaginatedResults,
} from "../utils";

async function handler(req, res) {
  const { method, query } = req;
  const log = req.log || console;

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
    log.error("Handler error", { error: error.message, stack: error.stack });
    handleError(res, error);
  }
}

// Wrap handler with withAxiom before exporting
export default process.env.NODE_ENV === "production"
  ? withAxiom(handler)
  : handler;
  
// GET /api/products/all - Return full array of all active products
async function handleFetchAllProducts(req, res) {
  const log = req.log || console;
  const start = Date.now();

  log.info("Fetching all active products", {
    method: req.method,
    query: req.query,
  });

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

    log.info("Products fetched successfully", {
      count: allProducts.length,
      duration: Date.now() - start,
    });

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
    log.error("Error fetching products", {
      error: error.message,
      stack: error.stack,
    });
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
  const log = req.log || console;
  const start = Date.now();

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

  log.info("Getting products", {
    id,
    sellerId,
    search,
    page,
    limit,
    orderBy,
    orderDirection,
  });

  try {
    // Get single product by ID
    if (id) {
      log.info("Fetching single product", { id });
      const productDoc = await adminDb.collection("products").doc(id).get();

      if (!productDoc.exists) {
        log.warn("Product not found", { id });
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      const productData = { id: productDoc.id, ...productDoc.data() };
      log.info("Product retrieved", { id, duration: Date.now() - start });
      return sendSuccess(res, productData, "Product retrieved successfully");
    }

    // Build query - only filter by sellerId
    log.info("Building product query");
    log.info("Requested sellerId:", sellerId);

    let query = adminDb.collection("products");

    // ONLY filter by sellerId if provided
    if (sellerId) {
      log.info("Filtering by sellerId:", sellerId);
      query = query.where("sellerId", "==", sellerId);
    } else {
      log.warn("⚠️ WARNING: No sellerId provided");
    }

    log.info("Query built successfully");

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

    log.info("Ordering by:", { orderField, orderDir });
    query = query.orderBy(orderField, orderDir);

    // Apply pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    if (pageNum > 1) {
      const offset = (pageNum - 1) * limitNum;
      query = query.offset(offset);
    }

    query = query.limit(limitNum);

    log.info("Executing query...");
    const snapshot = await query.get();

    log.info("Query returned", { documentsCount: snapshot.size });

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

    log.info("Final product count:", {
      count: products.length,
      duration: Date.now() - start,
    });

    const result = {
      results: products,
      totalFound: products.length,
      page: pageNum,
      limit: limitNum,
      hasMore: products.length === limitNum,
    };

    return sendSuccess(res, result, "Products retrieved successfully");
  } catch (error) {
    log.error("❌ ERROR in handleGetProducts:", {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - start,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to retrieve products",
      details: error.message,
    });
  }
}

// POST /api/products - Create new product
async function handleCreateProduct(req, res) {
  const log = req.log || console;
  const start = Date.now();

  try {
    const decoded = await verifyAuthToken(req);
    const body = req.body;

    log.info("Creating product", {
      sellerId: decoded.uid,
      productName: body.name,
    });

    if (!body.name) {
      log.warn("Product creation failed - missing name", {
        sellerId: decoded.uid,
      });
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

    log.info("Product created", {
      productId: ref.id,
      sellerId: decoded.uid,
      duration: Date.now() - start,
    });

    // Update seller stats
    try {
      await adminDb
        .collection("seller")
        .doc(decoded.uid)
        .update({
          "sellerStats.totalProducts": admin.firestore.FieldValue.increment(1),
          updatedAt: now,
        });
      log.info("Seller stats updated", { sellerId: decoded.uid });
    } catch (err) {
      log.error("Error updating seller stats:", {
        sellerId: decoded.uid,
        error: err.message,
      });
    }

    const created = { id: ref.id, ...newProduct };
    return sendSuccess(res, created, "Product created successfully", 201);
  } catch (err) {
    log.error("Error creating product", {
      error: err.message,
      stack: err.stack,
      duration: Date.now() - start,
    });
    return res
      .status(500)
      .json({ success: false, error: "Failed to create product" });
  }
}
