import { adminDb } from "../../../lib/firebaseAdmin";
import admin from "firebase-admin";
import {
  verifyAuthToken,
  handleError,
  sendSuccess,
  methodNotAllowed,
} from "../utils";

export default async function handler(req, res) {
  const { method, query } = req;
  const { uid: sellerId } = query;

  try {
    switch (method) {
      case "GET":
        await handleGetSeller(req, res, sellerId);
        break;
      case "PUT":
        await handleUpdateSeller(req, res, sellerId);
        break;
      case "DELETE":
        await handleDeleteSeller(req, res, sellerId);
        break;
      default:
        methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

// GET /api/seller/[id] - Get seller profile
async function handleGetSeller(req, res, sellerId) {
  try {
    const decodedToken = await verifyAuthToken(req);

    // Check if user is accessing their own profile or is admin
    if (decodedToken.uid !== sellerId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const sellerDoc = await adminDb.collection("seller").doc(sellerId).get();

    if (!sellerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    const sellerData = { id: sellerDoc.id, ...sellerDoc.data() };

    return sendSuccess(
      res,
      sellerData,
      "Seller profile retrieved successfully"
    );
  } catch (error) {
    console.error("Error getting seller:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get seller profile",
    });
  }
}

// PUT /api/seller/[id] - Update seller profile
async function handleUpdateSeller(req, res, sellerId) {
  try {
    const decodedToken = await verifyAuthToken(req);

    // Check if user is updating their own profile
    if (decodedToken.uid !== sellerId) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own profile",
      });
    }

    const updates = req.body;

    // Validate required fields
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No update data provided",
      });
    }

    // Prepare update data with proper structure
    const updateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Handle nested updates properly
    if (updates.businessInfo) {
      updateData.businessInfo = {
        ...updates.businessInfo,
      };
    }

    if (updates.bankInfo) {
      updateData.bankInfo = {
        ...updates.bankInfo,
      };
    }

    if (updates.socialLinks) {
      updateData.socialLinks = {
        ...updates.socialLinks,
      };
    }

    if (updates.storeSettings) {
      updateData.storeSettings = {
        ...updates.storeSettings,
      };
    }

    // Update the seller document
    const sellerRef = adminDb.collection("seller").doc(sellerId);

    // Check if seller exists
    const sellerDoc = await sellerRef.get();
    if (!sellerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    // Perform the update with merge to avoid overwriting existing fields
    await sellerRef.set(updateData, { merge: true });

    // Get the updated document
    const updatedDoc = await sellerRef.get();
    const updatedData = { id: updatedDoc.id, ...updatedDoc.data() };

    console.log(`Seller profile updated for ${sellerId}`);

    return sendSuccess(res, updatedData, "Seller profile updated successfully");
  } catch (error) {
    console.error("Error updating seller:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update seller profile",
    });
  }
}

// DELETE /api/seller/[id] - Delete seller profile (soft delete)
async function handleDeleteSeller(req, res, sellerId) {
  try {
    const decodedToken = await verifyAuthToken(req);

    // Check if user is deleting their own profile or is admin
    if (decodedToken.uid !== sellerId && decodedToken.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const sellerRef = adminDb.collection("seller").doc(sellerId);

    // Check if seller exists
    const sellerDoc = await sellerRef.get();
    if (!sellerDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    // Soft delete - mark as inactive instead of actually deleting
    await sellerRef.update({
      "storeSettings.isActive": false,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Seller profile deactivated for ${sellerId}`);

    return sendSuccess(
      res,
      { sellerId },
      "Seller profile deactivated successfully"
    );
  } catch (error) {
    console.error("Error deleting seller:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete seller profile",
    });
  }
}
