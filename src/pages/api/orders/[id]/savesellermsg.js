import { db } from "../../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const { sellerLatestMessage } = req.body; // expects { text, createdAt }

    if (
      !id ||
      !sellerLatestMessage?.text?.trim() ||
      !sellerLatestMessage?.createdAt
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update order with seller's latest message object
    await updateDoc(doc(db, "orders", id), {
      sellerLatestMessage: {
        text: sellerLatestMessage.text.trim(),
        createdAt: sellerLatestMessage.createdAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Seller message error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send message",
    });
  }
}
