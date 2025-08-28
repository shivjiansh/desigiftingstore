// pages/api/user/wishlist.js
import { adminDb } from "../../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  handleError,
  sendSuccess,
  methodNotAllowed,
} from "../../utils";
import admin from "firebase-admin";

export default async function handler(req, res) {
  const { method } = req;
  try {
    const decoded = await verifyAuthToken(req);
    const userId = decoded.uid;

    switch (method) {
      case "GET":
        await handleGetWishlist(req, res, userId);
        break;
      case "POST":
        await handleAddToWishlist(req, res, userId);
        break;
      case "DELETE":
        await handleRemoveFromWishlist(req, res, userId);
        break;
      default:
        methodNotAllowed(res, ["GET", "POST", "DELETE"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function handleGetWishlist(req, res, userId) {
  try {
    // Fetch wishlist array from user document
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const wishlist = userDoc.data()?.wishlist || [];

    // Batch fetch products
    const products = [];
    for (const productId of wishlist) {
      const prodSnap = await adminDb
        .collection("products")
        .doc(productId)
        .get();
      if (prodSnap.exists) {
        const data = prodSnap.data();
        products.push({
          id: prodSnap.id,
          name: data.name,
          price: data.price,
          offerPrice: data.offerPrice,
          images: data.images,
          rating: data.rating,
          reviewCount: data.reviewCount,
          businessName: data.businessName,
          sellerName: data.sellerName,
          hasOffer: data.hasOffer,
          offerPercentage: data.offerPercentage,
          stock: data.stock,
          category: data.category,
        });
      }
    }

    return sendSuccess(res, { products }, "Wishlist fetched successfully");
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
}

async function handleAddToWishlist(req, res, userId) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
      });
    }

    // Verify product exists
    const productDoc = await adminDb
      .collection("products")
      .doc(productId)
      .get();
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if product is already in wishlist
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const currentWishlist = userDoc.data()?.wishlist || [];

    if (currentWishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: "Product already in wishlist",
      });
    }

    // Add to wishlist
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      wishlist: admin.firestore.FieldValue.arrayUnion(productId),
      updatedAt: new Date().toISOString(),
    });

    return sendSuccess(res, { productId }, "Added to wishlist successfully");
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
}

async function handleRemoveFromWishlist(req, res, userId) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
      });
    }

    // Remove from wishlist
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      wishlist: adminDb.FieldValue.arrayRemove(productId),
      updatedAt: new Date().toISOString(),
    });

    return sendSuccess(
      res,
      { productId },
      "Removed from wishlist successfully"
    );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
}
