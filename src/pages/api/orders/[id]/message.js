import { db } from "../../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const { buyerLatestMessage } = req.body; // expecting { text, createdAt }

    if (
      !id ||
      !buyerLatestMessage?.text?.trim() ||
      !buyerLatestMessage?.createdAt
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update order with buyer's latest message object
    await updateDoc(doc(db, "orders", id), {
      buyerLatestMessage: {
        text: buyerLatestMessage.text.trim(),
        createdAt: buyerLatestMessage.createdAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Message error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send message",
    });
  }
}

