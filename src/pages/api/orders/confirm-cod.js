import { adminDb } from "../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  handleError,
  sendSuccess,
  methodNotAllowed,
} from "../utils";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    const decoded = await verifyAuthToken(req);
    const userId = decoded.uid;
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, error: "Order ID is required" });
    }

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const order = orderSnap.data();
    if (order.userId !== userId) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (order.paymentMethod !== "cod" || order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, error: "Cannot confirm this order" });
    }

    // Update status to 'confirmed'

    return sendSuccess(
      res,
      { orderId, status: updated.data().status },
      "Order confirmed"
    );
  } catch (error) {
    handleError(res, error);
  }
}
