import { adminDb } from "../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  handleError,
  sendSuccess,
  validateRequiredFields,
  sanitizeInput,
  methodNotAllowed,
  getPaginatedResults,
} from "../utils";

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        await handleGetSellers(req, res);
        break;
      case "POST":
        await handleCreateSeller(req, res);
        break;
      default:
        methodNotAllowed(res, ["GET", "POST"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// GET /api/seller - Get seller profile or list sellers
async function handleGetSellers(req, res) {
  const { uid, all, page = 1, limit = 20, search, featured } = req.query;

  if (uid) {
    console.log("Fetching seller profile for UID:", uid);
    // Get specific seller profile - requires authentication
    const decodedToken = await verifyAuthToken(req);

    // Allow seller to view their own profile or authenticated users to view seller info
    const sellerDoc = await adminDb.collection("seller").doc(uid).get();

    if (!sellerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }
  
    const sellerData = sellerDoc.data();
    console.log("Retrieved seller data for UID:", uid, sellerData);
    return res.status(200).json(sellerData);
  }

  // List sellers (public endpoint but requires authentication)
  const decodedToken = await verifyAuthToken(req);

  let filters = { isActive: true };

  if (featured === "true") {
    filters.isFeatured = true;
  }

  if (search) {
    // Add search functionality (this depends on your getPaginatedResults implementation)
    filters.searchTerm = search;
  }

  const sellers = await getPaginatedResults("seller", {
    filters,
    limit: parseInt(limit),
    page: parseInt(page),
    orderBy: featured === "true" ? "rating" : "createdAt",
    orderDirection: featured === "true" ? "desc" : "desc",
  });

  // Remove sensitive information from public seller listings
  const publicSellers = sellers.results.map((seller) => ({
    id: seller.id,
    businessName: seller.businessName,
    name: seller.name,
    rating: seller.rating || 0,
    reviewCount: seller.reviewCount || 0,
    totalProducts: seller.sellerStats?.totalProducts || 0,
    totalSales: seller.sellerStats?.totalSales || 0,
    memberSince: seller.createdAt,
    isVerified: seller.isVerified || false,
    logo: seller.logo,
    banner: seller.banner,
    description: seller.description,
    businessInfo: {
      businessName: seller.businessInfo?.businessName,
      businessType: seller.businessInfo?.businessType,
    },
  }));

  return sendSuccess(
    res,
    {
      ...sellers,
      results: publicSellers,
    },
    "Sellers retrieved successfully"
  );
}

// POST /api/seller - Create or update seller profile
async function handleCreateSeller(req, res) {
  // Verify authentication token
  const decodedToken = await verifyAuthToken(req);

  // Sanitize input data
  const sellerData = sanitizeInput(req.body);

  // Validate required fields for seller profile
  const requiredFields = [
    "name",
    "email",
    "phone",
    "businessName",
    "businessAddress",
  ];
  validateRequiredFields(sellerData, requiredFields);

  // Additional validation
  if (
    sellerData.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerData.email)
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
    });
  }

  // Validate phone number format
  const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
  if (!phoneRegex.test(sellerData.phone.replace(/\s+/g, ""))) {
    return res.status(400).json({
      success: false,
      error: "Invalid phone number format",
    });
  }

  // Validate business name length
  if (sellerData.businessName.length < 2) {
    return res.status(400).json({
      success: false,
      error: "Business name must be at least 2 characters long",
    });
  }

  // Prepare seller document
  const updatedSellerData = {
    ...sellerData,
    updatedAt: new Date().toISOString(),
    uid: decodedToken.uid,
    email: decodedToken.email || sellerData.email,
    emailVerified: decodedToken.email_verified || false,
  };

  try {
    // Check if this is a new seller or update
    const existingSeller = await adminDb
      .collection("seller")
      .doc(decodedToken.uid)
      .get();

    if (!existingSeller.exists) {
      // New seller - initialize seller-specific fields
      updatedSellerData.createdAt = new Date().toISOString();
      updatedSellerData.isActive = true;
      updatedSellerData.isVerified = false;
      updatedSellerData.rating = 0;
      updatedSellerData.reviewCount = 0;

      // Initialize seller statistics
      updatedSellerData.sellerStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0,
      };

      // Initialize business information
      updatedSellerData.businessInfo = {
        businessName: sellerData.businessName,
        businessAddress: sellerData.businessAddress,
        businessPhone: sellerData.businessPhone || sellerData.phone,
        taxId: sellerData.taxId || "",
        businessType: sellerData.businessType || "individual",
      };

      // Initialize store settings
      updatedSellerData.storeSettings = {
        processingTime: "3-5 business days",
        shippingPolicies: "",
        returnPolicy: "",
        customOrdersEnabled: true,
        minimumOrderValue: 0,
      };

      // Initialize social links
      updatedSellerData.socialLinks = {
        website: "",
        facebook: "",
        instagram: "",
        twitter: "",
      };

      // Initialize store branding
      updatedSellerData.logo = "";
      updatedSellerData.banner = "";
      updatedSellerData.description = "";
    }

    // Save to Firestore seller collection
    await adminDb
      .collection("seller")
      .doc(decodedToken.uid)
      .set(updatedSellerData, { merge: true });

    // Also update the users collection for cross-referencing
    const userUpdateData = {
      name: updatedSellerData.name,
      email: updatedSellerData.email,
      phone: updatedSellerData.phone,
      role: "seller",
      businessName: updatedSellerData.businessName,
      isActive: updatedSellerData.isActive,
      updatedAt: updatedSellerData.updatedAt,
    };

    if (!existingSeller.exists) {
      userUpdateData.createdAt = updatedSellerData.createdAt;
    }

    await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .set(userUpdateData, { merge: true });

    // Remove sensitive data from response
    const { password, ...safeSellerData } = updatedSellerData;

    sendSuccess(
      res,
      safeSellerData,
      existingSeller.exists
        ? "Seller profile updated successfully"
        : "Seller profile created successfully",
      existingSeller.exists ? 200 : 201
    );
  } catch (error) {
    console.error("Seller creation/update error:", error);

    // Handle specific Firestore errors
    let errorMessage = "Failed to create/update seller profile";

    if (error.code === "permission-denied") {
      errorMessage = "Permission denied. Please check your authentication.";
    } else if (error.code === "unavailable") {
      errorMessage = "Service temporarily unavailable. Please try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
