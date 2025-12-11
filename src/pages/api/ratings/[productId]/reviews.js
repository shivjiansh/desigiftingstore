// pages/api/ratings/[productId]/reviews.js
import { adminDb } from "../../../../lib/firebaseAdmin";
import admin from "firebase-admin";

// ✅ same helper you already use
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
  const { productId } = req.query;

  if (!productId) {
    return res
      .status(400)
      .json({ success: false, message: "productId is required" });
  }

  // 🔹 Public GET: list reviews for this product
  if (req.method === "GET") {
    try {
      const snap = await adminDb
        .collection("ratings")
        .doc(String(productId))
        .get();

      if (!snap.exists) {
        return res.status(200).json({ success: true, data: [] });
      }

      const data = snap.data();
      const reviews = Array.isArray(data.reviews) ? data.reviews : [];

      reviews.sort((a, b) => {
        const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bT - aT;
      });

      return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to load reviews" });
    }
  }

  // 🔹 Authenticated POST: create/update one review per user per product
  if (req.method === "POST") {
    try {
      const decodedToken = await verifyAuthToken(req);
      const userId = decodedToken.uid;

      const { rating, comment } = req.body;
      const numericRating = Number(rating);

      if (!numericRating || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const now = new Date().toISOString();
      const ratingsDocRef = adminDb
        .collection("ratings")
        .doc(String(productId));
      const productDocRef = adminDb
        .collection("products")
        .doc(String(productId));

      await adminDb.runTransaction(async (tx) => {
        const ratingsSnap = await tx.get(ratingsDocRef);

        let data =
          ratingsSnap.exists && ratingsSnap.data()
            ? ratingsSnap.data()
            : {
                average: 0,
                breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 },
                reviews: [],
              };

        const breakdown = data.breakdown || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          total: 0,
        };
        let reviews = Array.isArray(data.reviews) ? data.reviews : [];

        // One review per user per product
        const existingIndex = reviews.findIndex((r) => r.userId === userId);

        if (existingIndex >= 0) {
          const prevRating = reviews[existingIndex].rating;
          if (breakdown[prevRating]) breakdown[prevRating] -= 1;

          reviews[existingIndex] = {
            ...reviews[existingIndex],
            rating: numericRating,
            comment: comment || "",
            updatedAt: now,
          };
        } else {
          reviews.push({
            id: `${userId}_${productId}`,
            userId,
            productId,
            rating: numericRating,
            comment: comment || "",
            createdAt: now,
            updatedAt: now,
          });
          breakdown.total += 1;
        }

        // Update breakdown with new rating
        breakdown[numericRating] = (breakdown[numericRating] || 0) + 1;

        const sum =
          1 * (breakdown[1] || 0) +
          2 * (breakdown[2] || 0) +
          3 * (breakdown[3] || 0) +
          4 * (breakdown[4] || 0) +
          5 * (breakdown[5] || 0);
        const average = breakdown.total > 0 ? sum / breakdown.total : 0;

        tx.set(
          ratingsDocRef,
          {
            average,
            breakdown,
            reviews,
          },
          { merge: true }
        );

        tx.set(
          productDocRef,
          {
            ratings: {
              average,
              total: breakdown.total,
              breakdown,
            },
          },
          { merge: true }
        );
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      // token errors bubble from verifyAuthToken
      if (error.code === "UNAUTHENTICATED") {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      console.error("Error saving review:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save review" });
    }
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
}
