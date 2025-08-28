import { adminDb } from "../../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  handleError,
  sendSuccess,
  methodNotAllowed,
} from "../../utils";

export default async function handler(req, res) {
  const { method } = req;

  try {
    // Authentication required for all operations
    const decodedToken = await verifyAuthToken(req);

    switch (method) {
      case "GET":
        if (req.query.sellerId) {
          await handleGetSellerOrders(req, res, decoded);
        } else {
        await handleGetUserOrders(req, res, decodedToken);
        }
        break;
      default:
        methodNotAllowed(res, ["GET"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function handleGetSellerOrders(req, res, decoded) {
  const {
    sellerId,
    page = 1,
    limit = 20,
    status,
    dateFrom,
    dateTo,
  } = req.query;
  if (decoded.uid !== sellerId) {
    return res.status(403).json({ success: false, error: "Unauthorized" });
  }
  let query = adminDb.collection("orders").where("sellerId", "==", sellerId);
  if (status && status !== "all") query = query.where("status", "==", status);
  if (dateFrom) {
    const d = new Date(dateFrom);
    if (!isNaN(d)) query = query.where("createdAt", ">=", d);
  }
  if (dateTo) {
    const d = new Date(dateTo);
    d.setHours(23, 59, 59, 999);
    if (!isNaN(d)) query = query.where("createdAt", "<=", d);
  }
  query = query
    .orderBy("createdAt", "desc")
    .offset((page - 1) * limit)
    .limit(parseInt(limit));
  const snapshot = await query.get();
  const orders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
  }));
  return sendSuccess(res, { orders }, "Seller orders retrieved");
}


async function handleGetUserOrders(req, res, decodedToken) {
  try {
    const userId = decodedToken.uid;
    console.log("Fetching orders for user:", userId);
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
      paymentMethod,
      minAmount,
      maxAmount,
    } = req.query;

    // Build query
    let query = adminDb.collection("orders").where("userId", "==", userId);

    // Apply status filter
    if (status && status !== "all") {
      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ];
      if (validStatuses.includes(status)) {
        query = query.where("status", "==", status);
      }
    }

    // Apply payment method filter
    if (paymentMethod && ["razorpay", "cod"].includes(paymentMethod)) {
      query = query.where("paymentMethod", "==", paymentMethod);
    }

    // Apply date filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!isNaN(fromDate.getTime())) {
        query = query.where("createdAt", ">=", fromDate);
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (!isNaN(toDate.getTime())) {
        query = query.where("createdAt", "<=", toDate);
      }
    }

    // Apply sorting
    const validSortFields = ["createdAt", "totalAmount", "orderId", "status"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const orderDirection = sortOrder === "asc" ? "asc" : "desc";

    query = query.orderBy(orderField, orderDirection);

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (offset > 0) {
      query = query.offset(offset);
    }
    query = query.limit(limitNum);

    // Execute query
    const ordersSnapshot = await query.get();
    const orders = [];

    for (const doc of ordersSnapshot.docs) {
      const orderData = { id: doc.id, ...doc.data() };

      // Get order items
      const orderItemsSnapshot = await adminDb
        .collection("orders")
        .where("orderId", "==", doc.id)
        .get();

      const items = [];
      orderItemsSnapshot.forEach((itemDoc) => {
        const itemData = itemDoc.data();
        items.push({
          id: itemDoc.id,
          ...itemData,
          createdAt:
            itemData.createdAt?.toDate?.()?.toISOString() || itemData.createdAt,
          updatedAt:
            itemData.updatedAt?.toDate?.()?.toISOString() || itemData.updatedAt,
        });
      });

      orderData.items = items;

      // Apply amount filters on total amount
      if (minAmount && orderData.orderSummary?.total < parseFloat(minAmount)) {
        continue;
      }
      if (maxAmount && orderData.orderSummary?.total > parseFloat(maxAmount)) {
        continue;
      }

      // Convert timestamps
      orderData.createdAt =
        orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt;
      orderData.updatedAt =
        orderData.updatedAt?.toDate?.()?.toISOString() || orderData.updatedAt;

      // Convert other date fields if they exist
      if (orderData.estimatedDelivery) {
        orderData.estimatedDelivery =
          orderData.estimatedDelivery.toDate?.()?.toISOString() ||
          orderData.estimatedDelivery;
      }
      if (orderData.deliveredAt) {
        orderData.deliveredAt =
          orderData.deliveredAt.toDate?.()?.toISOString() ||
          orderData.deliveredAt;
      }
      if (orderData.cancelledAt) {
        orderData.cancelledAt =
          orderData.cancelledAt.toDate?.()?.toISOString() ||
          orderData.cancelledAt;
      }
      if (orderData.shippedAt) {
        orderData.shippedAt =
          orderData.shippedAt.toDate?.()?.toISOString() || orderData.shippedAt;
      }

      // Add tracking information if available
      try {
        const trackingDoc = await adminDb
          .collection("tracking")
          .doc(doc.id)
          .get();
        if (trackingDoc.exists) {
          orderData.tracking = trackingDoc.data();
        }
      } catch (error) {
        // Continue without tracking info
      }

      orders.push(orderData);
    }

    // Get total count and statistics
    const totalSnapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .get();

    let totalOrders = 0;
    let totalSpent = 0;
    let completedOrders = 0;
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    const paymentMethodCounts = {
      razorpay: 0,
      cod: 0,
    };

    totalSnapshot.forEach((doc) => {
      const data = doc.data();
      totalOrders++;

      const orderTotal = data.orderSummary?.total || 0;
      totalSpent += orderTotal;

      if (data.status === "delivered") {
        completedOrders++;
      }

      statusCounts[data.status] = (statusCounts[data.status] || 0) + 1;
      paymentMethodCounts[data.paymentMethod] =
        (paymentMethodCounts[data.paymentMethod] || 0) + 1;
    });

    // Get recent orders for quick access
    const recentOrdersSnapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(3)
      .get();

    const recentOrders = [];
    recentOrdersSnapshot.forEach((doc) => {
      const orderData = { id: doc.id, ...doc.data() };
      orderData.createdAt =
        orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt;
      recentOrders.push(orderData);
    });

    const result = {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limitNum),
        hasMore: orders.length === limitNum,
      },
      statistics: {
        totalOrders,
        completedOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        averageOrderValue:
          totalOrders > 0
            ? parseFloat((totalSpent / totalOrders).toFixed(2))
            : 0,
        statusBreakdown: statusCounts,
        paymentMethodBreakdown: paymentMethodCounts,
      },
      filters: {
        status: status || "all",
        paymentMethod: paymentMethod || "all",
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        minAmount: minAmount ? parseFloat(minAmount) : null,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
      },
      recentOrders,
      quickStats: {
        pendingOrders:
          statusCounts.pending +
          statusCounts.confirmed +
          statusCounts.processing,
        shippedOrders: statusCounts.shipped,
        deliveredOrders: statusCounts.delivered,
        cancelledOrders: statusCounts.cancelled + statusCounts.returned,
      },
    };

    return sendSuccess(res, result, "Orders retrieved successfully");
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
}
