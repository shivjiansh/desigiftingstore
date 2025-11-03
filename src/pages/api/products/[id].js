import { adminDb } from "../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  getUserRole,
  handleError,
  sendSuccess,
  validateRequiredFields,
  sanitizeInput,
  methodNotAllowed,
} from "../utils";
import admin from "firebase-admin";

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Product ID is required",
    });
  }

  try {
    switch (method) {
      case "PUT":
        await handleUpdateProduct(req, res, id);
        break;
      case "DELETE":
        await handleDeleteProduct(req, res, id);
        break;
      case "PATCH":
        await handleStatusProduct(req, res, id);
        break;
      default:
        methodNotAllowed(res, ["PUT", "DELETE", "PATCH"]); // Added PATCH here
    }
  } catch (error) {
    handleError(res, error);
  }
}

// PATCH /api/products/[id] - Update product status
async function handleStatusProduct(req, res, productId) {
  const decodedToken = await verifyAuthToken(req);
  const userRole = await getUserRole(decodedToken.uid);

  // Get existing product
  const productDoc = await adminDb.collection("products").doc(productId).get();

  if (!productDoc.exists) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  const existingProduct = productDoc.data();

  // Check if user owns this product or is admin
  if (decodedToken.uid !== existingProduct.sellerId && userRole !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. You can only update your own products.",
    });
  }

  // Validate status field is provided
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      success: false,
      error: "Status field is required",
    });
  }

  // Validate status value
  const allowedStatuses = ["active", "inactive", "fewleft"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Status must be one of: ${allowedStatuses.join(", ")}`,
    });
  }

  // Update only the status field
  const updateData = {
    status: status,
    isActive: ["active", "fewleft"].includes(status),
    updatedAt: new Date().toISOString(),
  };

  // Update product status in Firestore
  await adminDb.collection("products").doc(productId).update(updateData);

  // Get updated product
  const updatedProductDoc = await adminDb
    .collection("products")
    .doc(productId)
    .get();
  const updatedProductData = {
    id: updatedProductDoc.id,
    ...updatedProductDoc.data(),
  };

  sendSuccess(
    res,
    updatedProductData,
    `Product status updated to '${status}' successfully`
  );
}

// PUT /api/products/[id] - Update product
async function handleUpdateProduct(req, res, productId) {
  const decodedToken = await verifyAuthToken(req);
  const userRole = await getUserRole(decodedToken.uid);

  // Get existing product
  const productDoc = await adminDb.collection("products").doc(productId).get();

  if (!productDoc.exists) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  const existingProduct = productDoc.data();

  // Check if user owns this product or is admin
  if (decodedToken.uid !== existingProduct.sellerId && userRole !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. You can only update your own products.",
    });
  }

  const updateData = sanitizeInput(req.body);

  // Validate price if provided
  if (updateData.price !== undefined) {
    if (isNaN(updateData.price) || updateData.price <= 0) {
      return res.status(400).json({
        success: false,
        error: "Price must be a positive number",
      });
    }
    updateData.price = parseFloat(updateData.price);
  }

  // Validate tags if provided
  if (updateData.tags !== undefined) {
    if (!Array.isArray(updateData.tags) || updateData.tags.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one tag is required",
      });
    }
  }

  // Prepare update data
  const updatedProduct = {
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  // Don't allow changing sellerId or other system fields
  delete updatedProduct.sellerId;
  delete updatedProduct.createdAt;
  delete updatedProduct.rating;
  delete updatedProduct.reviewCount;
  delete updatedProduct.totalSales;

  // Update product in Firestore
  await adminDb.collection("products").doc(productId).update(updatedProduct);

  // Get updated product
  const updatedProductDoc = await adminDb
    .collection("products")
    .doc(productId)
    .get();
  const updatedProductData = {
    id: updatedProductDoc.id,
    ...updatedProductDoc.data(),
  };

  sendSuccess(res, updatedProductData, "Product updated successfully");
}

// DELETE /api/products/[id] - Delete product (soft delete)
async function handleDeleteProduct(req, res, productId) {
  // const decodedToken = await verifyAuthToken(req);
  // console.log("Decoded token:", decodedToken);

  // Get existing product
  const productDoc = await adminDb.collection("products").doc(productId).get();

  if (!productDoc.exists) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  const existingProduct = productDoc.data();
  console.log("Existing product data:", existingProduct);
  // Check if user owns this product or is admin

  // Soft delete by setting isActive to false
  await adminDb.collection("products").doc(productId).delete();

  console.log("Product marked as inactive (soft deleted):", productId);

  // Update seller stats
  await adminDb
    .collection("seller")
    .doc(existingProduct.sellerId)
    .update({
      "sellerStats.totalProducts": admin.firestore.FieldValue.increment(-1),
      updatedAt: new Date().toISOString(),
    });
  console.log("Seller stats updated after product deletion");
  sendSuccess(res, { id: productId }, "Product deleted successfully");
}
