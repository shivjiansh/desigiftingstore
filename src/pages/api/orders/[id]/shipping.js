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
        await handleUpdateShipping(req, res, id);
        break;
      default:
        methodNotAllowed(res, ["PATCH"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// PATCH /api/orders/[id]/shipping - Update shipping details and notify buyer
async function handleUpdateShipping(req, res, orderId) {
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

  const { carrier, trackingId } = sanitizeInput(req.body);

  // Validate required fields
  if (!trackingId || !trackingId.trim()) {
    return res.status(400).json({
      success: false,
      error: "Tracking ID is required",
    });
  }

  // Validate carrier
  const validCarriers = [
    "shiprocket",
    "delhivery",
    "bluedart",
    "fedex",
    "ups",
    "other",
  ];

  if (carrier && !validCarriers.includes(carrier)) {
    return res.status(400).json({
      success: false,
      error: `Invalid carrier. Valid options: ${validCarriers.join(", ")}`,
    });
  }

  // Sanitize inputs
  const sanitizedTrackingId = trackingId.trim().replace(/[^a-zA-Z0-9\-_]/g, "");
  const sanitizedCarrier = carrier || "other";
 

  if (!sanitizedTrackingId) {
    return res.status(400).json({
      success: false,
      error: "Tracking ID contains only invalid characters",
    });
  }

  const now = new Date().toISOString();
  const historyEntry = {
    type: "shipping_updated",
    timestamp: now,
    updatedBy: decoded.uid,
    carrier: sanitizedCarrier,
    trackingId: sanitizedTrackingId,
    
    note: `Shipping updated with carrier ${sanitizedCarrier} and tracking ${sanitizedTrackingId}`,
  };

  const updatedData = {
    carrier: sanitizedCarrier,
    trackingId: sanitizedTrackingId,
    shippedAt: order.shippedAt || now,
    updatedAt: now,
    shippingHistory: [...(order.shippingHistory || []), historyEntry],
  };

  await orderRef.update(updatedData);

  // TODO: Send notification to buyer (email/SMS) with tracking link and custom message
  // Example:
  // await sendBuyerShippingNotification({
  //   orderId,
  //   buyerEmail: order.buyerEmail,
  //   buyerPhone: order.deliveryAddress?.phone,
  //   carrier: sanitizedCarrier,
  //   trackingId: sanitizedTrackingId,
  //   buyerMessage: sanitizedMessage,
  //   trackingUrl: generateTrackingUrl(sanitizedCarrier, sanitizedTrackingId)
  // });

  const updatedOrderSnap = await orderRef.get();
  const updatedOrder = { id: updatedOrderSnap.id, ...updatedOrderSnap.data() };

  return sendSuccess(
    res,
    updatedOrder,
    "Shipping details updated successfully. Buyer will be notified."
  );
}

// Helper to generate carrier tracking URLs
function generateTrackingUrl(carrier, trackingId) {
  const urls = {
    shiprocket: `https://shiprocket.co/tracking/${trackingId}`,
    delhivery: `https://www.delhivery.com/track/package/${trackingId}`,
    bluedart: `https://www.bluedart.com/tracking/${trackingId}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingId}`,
    ups: `https://www.ups.com/track?tracknum=${trackingId}`,
    other: `https://www.google.com/search?q=${trackingId}`,
  };
  return urls[carrier] || urls.other;
}
