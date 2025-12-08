// lib/sendNotification.js
export async function sendNotification(userId, type, title, body, url) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, type, title, body, url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Notification error:", error);
    return { success: false };
  }
}
