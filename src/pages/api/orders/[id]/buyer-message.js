import { adminDb } from "../../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  getUserRole,
  handleError,
  sendSuccess,
  methodNotAllowed,
  sanitizeInput,
} from "../../utils";

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Order ID is required" });
  }

  try {
    switch (method) {
      case "PATCH":
        await handleSaveBuyerMessage(req, res, id);
        break;
      default:
        methodNotAllowed(res, ["PATCH"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function handleSaveBuyerMessage(req, res, orderId) {
  const decoded = await verifyAuthToken(req);
  const role = await getUserRole(decoded.uid);

  const orderRef = adminDb.collection("orders").doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }
  const order = snap.data();

  // Only seller who owns the order (or admin) can update
  if (role === "seller" && order.sellerId !== decoded.uid) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const { buyerMessage } = sanitizeInput(req.body || {});
  const text = (buyerMessage || "").trim();
  if (!text) {
    return res
      .status(400)
      .json({ success: false, error: "Message cannot be empty" });
  }
  if (text.length > 500) {
    return res.status(400).json({ success: false, error: "Message too long" });
  }

  const now = new Date().toISOString();
  const updated = {
    buyerMessage: text,
    updatedAt: now,
    messageHistory: [
      ...(order.messageHistory || []),
      {
        type: "buyer_message",
        timestamp: now,
        updatedBy: decoded.uid,
        message: text,
      },
    ],
  };

  await orderRef.update(updated);

  const updatedOrder = {
    id: orderId,
    ...(await (await orderRef.get()).data()),
  };
  return sendSuccess(res, updatedOrder, "Buyer message saved");
}
