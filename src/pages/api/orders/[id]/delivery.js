import { adminDb } from "../../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  getUserRole,
  handleError,
  sendSuccess,
  validateRequiredFields,
  sanitizeInput,
  methodNotAllowed,
} from "../../utils";

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Order ID is required",
    });
  }

  try {
    switch (method) {
      case "PATCH":
        await handleUpdateExpectedDelivery(req, res, id);
        break;
      default:
        methodNotAllowed(res, ["PATCH"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// PATCH /api/orders/[id]/delivery - Update expected delivery date
async function handleUpdateExpectedDelivery(req, res, orderId) {
  const decoded = await verifyAuthToken(req);
  const role = await getUserRole(decoded.uid);

  const orderRef = adminDb.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  const order = orderSnap.data();

  // Verify seller ownership (if seller role)
  if (role === "seller" && order.sellerId !== decoded.uid) {
    return res.status(403).json({
      success: false,
      error: "Unauthorized: You don't have permission to update this order",
    });
  }

  const { expectedDelivery } = sanitizeInput(req.body);

  if (!expectedDelivery) {
    return res.status(400).json({
      success: false,
      error: "Expected delivery date is required",
    });
  }

  // Validate date format and ensure it's not in the past
  const deliveryDate = new Date(expectedDelivery);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(deliveryDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: "Invalid date format",
    });
  }

  if (deliveryDate < today) {
    return res.status(400).json({
      success: false,
      error: "Expected delivery date cannot be in the past",
    });
  }

  const now = new Date().toISOString();
  const historyEntry = {
    type: "delivery_date_updated",
    timestamp: now,
    updatedBy: decoded.uid,
    previousDate: order.expectedDelivery || null,
    newDate: expectedDelivery,
    note: `Expected delivery date updated to ${expectedDelivery}`,
  };

  const updatedData = {
    expectedDelivery,
    updatedAt: now,
    deliveryHistory: [...(order.deliveryHistory || []), historyEntry],
  };

  await orderRef.update(updatedData);

  const updatedOrderSnap = await orderRef.get();
  const updatedOrder = { id: updatedOrderSnap.id, ...updatedOrderSnap.data() };

  return sendSuccess(
    res,
    updatedOrder,
    "Expected delivery date updated successfully"
  );
}
