import { adminDb } from '../../../../lib/firebaseAdmin';
import { 
  verifyAuthToken, 
  getUserRole,
  handleError, 
  sendSuccess, 
  validateRequiredFields, 
  sanitizeInput, 
  methodNotAllowed 
} from '../../utils';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required'
    });
  }

  try {
    switch (method) {
      case 'PATCH':
        await handleUpdateOrderStatus(req, res, id);
        break;
      default:
        methodNotAllowed(res, ['PUT']);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// PUT /api/orders/[id]/status - Update order status
async function handleUpdateOrderStatus(req, res, orderId) {
  const decoded = await verifyAuthToken(req);
  const role = await getUserRole(decoded.uid);

  const orderRef = adminDb.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  const order = orderSnap.data();

  

  const { status, tracking, notes } = sanitizeInput(req.body);
  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Valid: ${validStatuses.join(", ")}`,
    });
  }

  const now = new Date().toISOString();
  const historyEntry = {
    status,
    timestamp: now,
    updatedBy: decoded.uid,
    note: notes || `Status updated to ${status}`,
    ...(tracking ? { tracking } : {}),
  };

  const updatedData = {
    status,
    updatedAt: now,
    statusHistory: [...(order.statusHistory || []), historyEntry],
    ...(tracking ? { tracking } : {}),
  };

  await orderRef.update(updatedData);

  const updatedOrderSnap = await orderRef.get();
  const updatedOrder = { id: updatedOrderSnap.id, ...updatedOrderSnap.data() };

  return sendSuccess(res, updatedOrder, "Order updated successfully");
}