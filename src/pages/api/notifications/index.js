import { adminDb } from "../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  const { method, query } = req;
  const { userId, limit = 10, unreadFirst = "true", id } = query;

  if (method === "POST") {
    return handleSendNotification(req, res);
  }

  if (method === "GET") {
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId query parameter required" });
    }
    return handleGetNotifications(req, res, {
      userId,
      limit: parseInt(limit, 10),
      unreadFirst: unreadFirst === "true",
    });
  }

  if (method === "PATCH") {
    // /api/notifications?id=notificationId
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Notification id is required" });
    }
    return handleMarkRead(req, res, id);
  }

  return res
    .status(405)
    .json({ success: false, error: `Method ${method} Not Allowed` });
}

async function handleSendNotification(req, res) {
  try {
    const { userId, type, title, body, url } = req.body;

    if (!userId || !type || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, type, title, body",
      });
    }

    if (!["order", "message", "system"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid notification type" });
    }

    const notification = {
      userId,
      type,
      title,
      body,
      url,
      isRead: false,
      createdAt: new Date().toISOString(), // ✅ ISO string for safe parsing
    };

    await adminDb.collection("notifications").add(notification);

    return res
      .status(201)
      .json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error("Send notification error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send notification" });
  }
}

async function handleGetNotifications(req, res, { userId, limit }) {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch notifications" });
  }
}

// ✅ NEW: mark a single notification as read
async function handleMarkRead(req, res, id) {
  try {
    await adminDb.collection("notifications").doc(id).update({
      isRead: true,
    }); // updates only field[web:10]

    return res
      .status(200)
      .json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to mark notification as read" });
  }
}
