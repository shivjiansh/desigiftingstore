import { adminDb } from "../../../lib/firebaseAdmin";
import admin from "firebase-admin";

export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }

    const { sellerId, page = 1, limit = 10 } = req.query;

    // Validation
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: "Seller ID is required",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        error: "Invalid pagination parameters",
      });
    }

    const offset = (pageNum - 1) * limitNum;

    console.log(
      `Fetching reviews for seller: ${sellerId}, page: ${pageNum}, limit: ${limitNum}`
    );

    // Get reviews for seller with pagination
    // We fetch one extra item to check if there are more pages
    const reviewsQuery = adminDb
      .collection("ratings")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .limit(limitNum + 1)
      .offset(offset);

    const reviewsSnapshot = await reviewsQuery.get();

    // Check if there are more reviews beyond current page
    const hasMore = reviewsSnapshot.docs.length > limitNum;

    // Get only the requested number of reviews (exclude the extra one)
    const reviewDocs = reviewsSnapshot.docs.slice(0, limitNum);

    console.log(`Found ${reviewDocs.length} reviews, hasMore: ${hasMore}`);

    // Process reviews and get user information
    const reviewsWithUserInfo = await Promise.all(
      reviewDocs.map(async (doc) => {
        const reviewData = doc.data();
        let userName = "Anonymous User";
        let userEmail = "";

        try {
          // Try to get user information from Firebase Auth
          const userRecord = await admin.auth().getUser(reviewData.userId);

          // Use display name, or extract name from email, or use email
          if (userRecord.displayName) {
            userName = userRecord.displayName;
          } else if (userRecord.email) {
            userName = userRecord.email.split("@")[0];
            userEmail = userRecord.email;
          }
        } catch (authError) {
          console.warn(
            `Could not fetch user info for ${reviewData.userId}:`,
            authError.message
          );
          // Keep default 'Anonymous User' for deleted or invalid users
        }

        // Format the review data
        return {
          id: doc.id,
          userId: reviewData.userId,
          sellerId: reviewData.sellerId,
          rating: reviewData.rating,
          comment: reviewData.comment || "",
          userName,
          userEmail,
          createdAt:
            reviewData.createdAt?.toDate?.() || new Date(reviewData.createdAt),
          updatedAt:
            reviewData.updatedAt?.toDate?.() || new Date(reviewData.updatedAt),
        };
      })
    );

    // Sort by creation date (newest first) as a backup
    reviewsWithUserInfo.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      data: {
        reviews: reviewsWithUserInfo,
        hasMore,
        currentPage: pageNum,
        totalOnPage: reviewsWithUserInfo.length,
        requestedLimit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);

    // Handle specific Firestore errors
    if (error.code === "permission-denied") {
      return res.status(403).json({
        success: false,
        error: "Permission denied to access reviews",
      });
    }

    if (error.code === "not-found") {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to fetch reviews. Please try again.",
    });
  }
}
