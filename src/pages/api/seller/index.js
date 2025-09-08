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

// Helper function to safely trim strings
const safeTrim = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

// POST /api/seller - Create or update seller profile
async function handleCreateSeller(req, res) {
  try {
    // Verify authentication token
    const decodedToken = await verifyAuthToken(req);

    // Sanitize input data
    console.log("Raw request body for seller registration :) ", req.body);
    const formData = sanitizeInput(req.body);

    // Validate required fields for seller profile
    const requiredFields = ["name", "phone", "email"];
    validateRequiredFields(formData, requiredFields);

    // Validate businessInfo object structure
    if (!formData.businessInfo || typeof formData.businessInfo !== "object") {
      return res.status(400).json({
        success: false,
        error: "businessInfo is required and must be an object",
      });
    }

    // Validate required businessInfo fields
    if (
      !formData.businessInfo.businessName ||
      typeof formData.businessInfo.businessName !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "businessInfo.businessName is required and must be a string",
      });
    }

    // Additional validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Validate phone number format
    const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
    const cleanPhone = safeTrim(formData.phone).replace(/\s+/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format",
      });
    }

    // Check if seller already exists
    const existingSeller = await adminDb
      .collection("seller")
      .doc(decodedToken.uid)
      .get();

    if (existingSeller.exists) {
      return res.status(400).json({
        success: false,
        error: "Seller profile already exists",
      });
    }

    // Prepare seller document with safe property access
    const sellerData = {
      uid: decodedToken.uid,
      email: formData.email,
      isEmailVerified: decodedToken.email_verified || false,
      name: safeTrim(formData.name) || "Unnamed Seller",
      phone: safeTrim(formData.phone) || "0000000000",
      isPhoneVerified: false,
      role: "seller",

      // Seller-specific fields
      businessInfo: {
        businessName:
          safeTrim(formData.businessInfo?.businessName) ||
          safeTrim(formData.name) ||
          "Unnamed Business",
        tagline: "",
        description: "",
        businessPhone:
          safeTrim(formData.businessInfo?.businessPhone) ||
          safeTrim(formData.phone) ||
          "",
        address: {
          street: safeTrim(formData.businessInfo?.address?.street),
          city: safeTrim(formData.businessInfo?.address?.city),
          state: safeTrim(formData.businessInfo?.address?.state),
          pincode: safeTrim(formData.businessInfo?.address?.pincode),
          country: safeTrim(formData.businessInfo?.address?.country) || "India",
        },
        businessType: formData.businessType || "individual",
        badge: {
          isVerified: false,
          isToprated: false, // average rating of ≥ 4.5 stars across at least 50 reviews
          isShipper: false, // on time shipment
          isAged: false, // seller account age > 6 months
          isTrusted: false, // Completed ≥ 100 orders with on-time shipping ≥ 95%, complaint rate ≤ 2%
          isPowerSeller: false, // BestSeller for 3 consecutive months
          isBestSeller: false, // Completed max orders in a month
          isCustomerFav: false, // 5-star rating on ≥ 95% of orders, Completed ≥ 200 orders
        },
        logo: "",
        banner: "",
        gstNumber: safeTrim(formData.businessInfo?.gstNumber),
      },

      // Seller bankInfo
      bankInfo: {
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        ifscCode: "",
      },

      // Seller statistics
      sellerStats: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalSales: 0,
        maxSalesInMonth: 0,
        ratings: {
          average: 0, // Average rating (1-5)
          total: 0, // Total number of reviews
          breakdown: {
            5: 0, // Number of 5-star reviews
            4: 0, // Number of 4-star reviews
            3: 0, // Number of 3-star reviews
            2: 0, // Number of 2-star reviews
            1: 0, // Number of 1-star reviews
          },
        },
        averageOrderValue: 0,
      },

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),

      // Additional seller fields
      socialLinks: {
        website: "",
        facebook: "",
        instagram: "",
        twitter: "",
      },

      // Store settings
      storeSettings: {
        processingTime: "3-5 business days",
        shippingPolicies: "",
        returnPolicy: "",
        customOrdersEnabled: true,
        minimumOrderValue: 0,
        isActive: true,
      },
    };

    //create users collection with role seller
    await adminDb.collection("users").doc(decodedToken.uid).set({
      uid: decodedToken.uid,
      email: formData.email,
      name: safeTrim(formData.name) || "Unnamed Seller",
      phone: safeTrim(formData.phone) || "0000000000",
      role: "seller",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save to Firestore sellers collection
    await adminDb.collection("seller").doc(decodedToken.uid).set(sellerData);

    // Remove sensitive data from response
    const { bankInfo, ...safeSellerData } = sellerData;

    sendSuccess(
      res,
      safeSellerData,
      "Seller profile created successfully",
      201
    );
  } catch (error) {
    console.error("Seller creation error:", error);

    // Handle specific Firestore errors
    let errorMessage = "Failed to create seller profile";

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
