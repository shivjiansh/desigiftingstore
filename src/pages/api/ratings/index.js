import { adminDb } from "../../../lib/firebaseAdmin";
import admin from "firebase-admin";

// Verify Firebase Auth token
async function verifyAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const err = new Error("No authorization header");
    err.code = "UNAUTHENTICATED";
    throw err;
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken;
}

export default async function handler(req, res) {
  try {
    // GET /api/ratings?sellerId=...
    if (req.method === "GET") {
      const decodedToken = await verifyAuthToken(req);
      const userId = decodedToken.uid;
      const { sellerId } = req.query;

      if (!sellerId) {
        return res.status(400).json({
          success: false,
          error: "Seller ID is required",
        });
      }

      // Check if user has rated this seller
      const snapshot = await adminDb
        .collection("ratings")
        .where("userId", "==", userId)
        .where("sellerId", "==", sellerId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(200).json({
          success: true,
          data: { hasRated: false },
        });
      }

      const ratingData = snapshot.docs[0].data();
      return res.status(200).json({
        success: true,
        data: {
          hasRated: true,
          rating: ratingData.rating,
          comment: ratingData.comment || "",
        },
      });
    }

    // POST /api/ratings
    if (req.method === "POST") {
      const decodedToken = await verifyAuthToken(req);
      const userId = decodedToken.uid;
      const { sellerId, rating, comment } = req.body;

      // Validation
      if (!sellerId) {
        return res.status(400).json({
          success: false,
          error: "Seller ID is required",
        });
      }
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: "Rating must be between 1 and 5",
        });
      }
      if (userId === sellerId) {
        return res.status(400).json({
          success: false,
          error: "You cannot rate your own store",
        });
      }

      // Check seller exists
      const sellerDoc = await adminDb.collection("seller").doc(sellerId).get();
      if (!sellerDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "Seller not found",
        });
      }

      // Check existing
      const existingQuery = await adminDb
        .collection("ratings")
        .where("userId", "==", userId)
        .where("sellerId", "==", sellerId)
        .limit(1)
        .get();
      const isUpdate = !existingQuery.empty;

      if (isUpdate) {
        const docRef = existingQuery.docs[0].ref;
        await docRef.update({
          rating: parseInt(rating),
          comment: comment?.trim() || "",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await adminDb.collection("ratings").add({
          userId,
          sellerId,
          rating: parseInt(rating),
          comment: comment?.trim() || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Update stats
      await updateSellerRatingStats(sellerId);

      return res.status(200).json({
        success: true,
        message: isUpdate
          ? "Rating updated successfully"
          : "Rating submitted successfully",
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Error in /api/ratings:", error);
    if (error.code === "UNAUTHENTICATED") {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Updates seller's rating statistics based on all ratings
 */
async function updateSellerRatingStats(sellerId) {
  const ratingsSnapshot = await adminDb
    .collection("ratings")
    .where("sellerId", "==", sellerId)
    .get();

  const ratings = ratingsSnapshot.docs.map((doc) => doc.data().rating);
  const totalReviews = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  const average = totalReviews > 0 ? sum / totalReviews : 0;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    breakdown[r] = (breakdown[r] || 0) + 1;
  });

  await adminDb
    .collection("seller")
    .doc(sellerId)
    .update({
      "sellerStats.ratings": {
        average: parseFloat(average.toFixed(2)),
        total: totalReviews,
        breakdown,
      },
    });
}
