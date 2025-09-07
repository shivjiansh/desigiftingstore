import { adminDb } from "../../../lib/firebaseAdmin";
import admin from "firebase-admin";

// Helper function to verify auth token
async function verifyAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken;
}

// Helper function to get customer info
async function getCustomerInfo(customerId) {
  try {
    const customerDoc = await adminDb.collection("users").doc(customerId).get();

    if (customerDoc.exists) {
      const customerData = customerDoc.data();
      return {
        name:
          customerData.name ||
          customerData.displayName ||
          customerData.email?.split("@")[0] ||
          "Anonymous Customer",
        email: customerData.email || null,
      };
    }

    return { name: "Unknown Customer", email: null };
  } catch (error) {
    console.warn(`Could not fetch customer info for ${customerId}:`, error);
    return { name: "Unknown Customer", email: null };
  }
}

export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }

    // Verify authentication
    let decodedToken;
    try {
      decodedToken = await verifyAuthToken(req);
    } catch (authError) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const sellerId = decodedToken.uid;

    // Query recent orders for this seller
    const ordersQuery = adminDb
      .collection("orders")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .limit(10); // Get last 10 orders

    const ordersSnapshot = await ordersQuery.get();
   

    if (ordersSnapshot.empty) {
      return res.status(200).json({
        success: true,
        data: {
          recentOrders: [],
        },
      });
    }

    // Process orders and enrich with customer data
    const recentOrders = [];

    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();

      // Get customer information
      const customerInfo = await getCustomerInfo(
        orderData.buyerId || orderData.customerId
      );

      // Calculate total items
      let totalItems = 1;
      if (orderData.items && Array.isArray(orderData.items)) {
        totalItems = orderData.items.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
      } else if (orderData.quantity) {
        totalItems = orderData.quantity;
      }

      // Format order data
      const order = {
        id: doc.id,
        
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        amount: orderData.totalAmount || orderData.amount || 0,
        status: orderData.status || "pending",
        createdAt:
          orderData.createdAt?.toDate?.() ||
          (orderData.createdAt ? new Date(orderData.createdAt) : new Date()),
        items: totalItems,
        productName:
          orderData.productName ||
          orderData.items?.[0]?.name ||
          "Custom Product",
        // Additional useful fields
        orderId: orderData.orderId || doc.id,
        paymentStatus: orderData.paymentStatus || "pending",
        shippingAddress: orderData.shippingAddress || null,
      };

      recentOrders.push(order);
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        recentOrders,
        total: recentOrders.length,
      },
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);

    // Handle specific error types
    if (error.message.includes("permission")) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
