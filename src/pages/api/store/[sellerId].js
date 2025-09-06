import { adminDb } from "../../../lib/firebaseAdmin";
import { handleError, sendSuccess, methodNotAllowed } from "../utils";

export default async function handler(req, res) {
  const { method, query } = req;
  const { sellerId } = query;

  if (!sellerId) {
    return res.status(400).json({
      success: false,
      error: "Seller ID is required",
    });
  }

  try {
    switch (method) {
      case "GET":
        await handleGetSeller(req, res, sellerId);
        break;
      default:
        methodNotAllowed(res, ["GET"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function handleGetSeller(req, res, sellerId) {
  try {
    // Get seller document
    const sellerDoc = await adminDb.collection("seller").doc(sellerId).get();

    if (!sellerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    const sellerData = { id: sellerDoc.id, ...sellerDoc.data() };

    // Only return public seller data if not authenticated or not the seller themselves

    // Get seller's products
    const productsSnapshot = await adminDb
      .collection("products")
      .where("sellerId", "==", sellerId)
      .get();

    sellerData.productCount = productsSnapshot.size;

    // Calculate seller statistics
    let totalSales = 0;
    let totalRevenue = 0;
    const categories = new Set();

    productsSnapshot.forEach((productDoc) => {
      const product = productDoc.data();
      totalSales += product.totalSales || 0;
      totalRevenue += (product.totalSales || 0) * (product.price || 0);

      if (product.category) {
        categories.add(product.category);
      }
    });

    sellerData.totalSales = totalSales;
    sellerData.totalRevenue = totalRevenue;
    sellerData.categories = Array.from(categories);

    // Get reviews and calculate rating
    const reviewsSnapshot = await adminDb
      .collection("reviews")
      .where("sellerId", "==", sellerId)
      .get();

    if (reviewsSnapshot.size > 0) {
      let totalRating = 0;
      const reviews = [];

      reviewsSnapshot.forEach((reviewDoc) => {
        const review = reviewDoc.data();
        totalRating += review.rating || 0;
        reviews.push({
          id: reviewDoc.id,
          ...review,
          createdAt:
            review.createdAt?.toDate?.()?.toISOString() || review.createdAt,
        });
      });

      sellerData.rating = totalRating / reviewsSnapshot.size;
      sellerData.reviewCount = reviewsSnapshot.size;
      sellerData.reviews = reviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10); // Latest 10 reviews
    } else {
      sellerData.rating = 0;
      sellerData.reviewCount = 0;
      sellerData.reviews = [];
    }

    // Calculate years active
    if (sellerData.createdAt) {
      const joinDate = new Date(sellerData.createdAt);
      const currentDate = new Date();
      sellerData.yearsActive = Math.max(
        1,
        Math.floor((currentDate - joinDate) / (365 * 24 * 60 * 60 * 1000))
      );
    } else {
      sellerData.yearsActive = 1;
    }

    // Get order completion stats
    const ordersSnapshot = await adminDb
      .collection("orders")
      .where("sellerId", "==", sellerId)
      .get();

    let completedOrders = 0;
    let totalOrders = ordersSnapshot.size;
    let avgResponseTime = "2-4 hours"; // Default

    ordersSnapshot.forEach((orderDoc) => {
      const order = orderDoc.data();
      if (order.status === "delivered" || order.status === "completed") {
        completedOrders++;
      }
    });

    sellerData.satisfactionRate =
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 98;
    sellerData.responseTime = avgResponseTime;

    // Convert timestamps
    sellerData.createdAt =
      sellerData.createdAt?.toDate?.()?.toISOString() || sellerData.createdAt;
    sellerData.updatedAt =
      sellerData.updatedAt?.toDate?.()?.toISOString() || sellerData.updatedAt;
    sellerData.joinedAt = sellerData.createdAt;

    // Remove sensitive information for public view
    delete sellerData.hashedPassword;
    delete sellerData.stripeAccountId;
    delete sellerData.bankDetails;
    delete sellerData.taxInfo;

    const result = {
      ...sellerData,
      stats: {
        totalProducts: sellerData.productCount,
        totalSales: sellerData.totalSales,
        totalRevenue: sellerData.totalRevenue,
        rating: sellerData.rating,
        reviewCount: sellerData.reviewCount,
        yearsActive: sellerData.yearsActive,
        satisfactionRate: sellerData.satisfactionRate,
        responseTime: sellerData.responseTime,
      },
    };

    return sendSuccess(res, result, "Seller details retrieved successfully");
  } catch (error) {
    console.error("Error fetching seller details:", error);
    throw error;
  }
}
