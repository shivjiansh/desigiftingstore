import { adminDb } from "../../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  handleError,
  sendSuccess,
  methodNotAllowed,
} from "../../utils";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    // Authentication required for all operations
    const decodedToken = await verifyAuthToken(req);

    switch (method) {
      case "GET":
        await handleGetSingleAddress(req, res, decodedToken, id);
        break;
      case "DELETE":
        await handleDeleteAddress(req, res, decodedToken, id);
        break;
      case "PUT":
        await handleUpdateSingleAddress(req, res, decodedToken, id);
        break;
      default:
        methodNotAllowed(res, ["GET", "DELETE", "PUT"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function handleGetSingleAddress(req, res, decodedToken, addressId) {
  try {
    const userId = decodedToken.uid;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        error: "Address ID is required",
      });
    }

    // Get address
    const addressDoc = await adminDb
      .collection("addresses")
      .doc(addressId)
      .get();

    if (!addressDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    const addressData = addressDoc.data();

    // Check ownership
    if (addressData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const responseData = {
      id: addressId,
      ...addressData,
      createdAt:
        addressData.createdAt?.toDate?.()?.toISOString() ||
        addressData.createdAt,
      updatedAt:
        addressData.updatedAt?.toDate?.()?.toISOString() ||
        addressData.updatedAt,
    };

    return sendSuccess(res, responseData, "Address retrieved successfully");
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
}

async function handleDeleteAddress(req, res, decodedToken, addressId) {
  try {
    const userId = decodedToken.uid;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        error: "Address ID is required",
      });
    }

    // Get address to verify ownership and check if it's default
    const addressDoc = await adminDb
      .collection("addresses")
      .doc(addressId)
      .get();

    if (!addressDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    const addressData = addressDoc.data();

    // Check ownership
    if (addressData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own addresses",
      });
    }

    // Check if this is the only address
    const userAddressesSnapshot = await adminDb
      .collection("addresses")
      .where("userId", "==", userId)
      .get();

    if (userAddressesSnapshot.size === 1) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete your only address. Please add another address first.",
      });
    }

    // Check if address is being used in any pending orders
    const pendingOrdersSnapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .where("deliveryAddress.id", "==", addressId)
      .where("status", "in", ["pending", "confirmed", "processing", "shipped"])
      .get();

    if (!pendingOrdersSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete address that is being used in pending orders. Please wait for orders to be delivered or cancelled.",
      });
    }

    const wasDefault = addressData.isDefault;

    // Delete the address
    await adminDb.collection("addresses").doc(addressId).delete();

    // If deleted address was default, make another address default
    if (wasDefault) {
      const remainingAddressesSnapshot = await adminDb
        .collection("addresses")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!remainingAddressesSnapshot.empty) {
        const newDefaultAddress = remainingAddressesSnapshot.docs[0];
        await newDefaultAddress.ref.update({
          isDefault: true,
          updatedAt: new Date(),
        });

        console.log(
          `Set address ${newDefaultAddress.id} as new default for user ${userId}`
        );
      }
    }

    // Update user stats
    await adminDb
      .collection("users")
      .doc(userId)
      .update({
        "stats.totalAddresses": adminDb.FieldValue.increment(-1),
        updatedAt: new Date(),
      });

    const responseData = {
      id: addressId,
      wasDefault: wasDefault,
      message: wasDefault
        ? "Default address deleted successfully. Another address has been set as default."
        : "Address deleted successfully",
    };

    return sendSuccess(res, responseData, "Address deleted successfully");
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
}

async function handleUpdateSingleAddress(req, res, decodedToken, addressId) {
  try {
    const userId = decodedToken.uid;
    const updateData = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        error: "Address ID is required",
      });
    }

    // Get existing address
    const addressDoc = await adminDb
      .collection("addresses")
      .doc(addressId)
      .get();

    if (!addressDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    const existingAddress = addressDoc.data();

    // Check ownership
    if (existingAddress.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own addresses",
      });
    }

    // Fields that can be updated
    const allowedFields = [
      "name",
      "phone",
      "addressLine1",
      "addressLine2",
      "landmark",
      "city",
      "state",
      "pincode",
      "country",
      "type",
      "isDefault",
      "latitude",
      "longitude",
    ];

    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        if (typeof updateData[key] === "string") {
          filteredData[key] = updateData[key].trim();
        } else {
          filteredData[key] = updateData[key];
        }
      }
    });

    // Validate if provided
    if (filteredData.pincode) {
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(filteredData.pincode)) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid pincode format. Please enter a valid 6-digit Indian postal code",
        });
      }
    }

    if (filteredData.phone) {
      const phoneRegex = /^[+]?[1-9][0-9\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(filteredData.phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone number format",
        });
      }
    }

    if (filteredData.name && filteredData.name.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Name must be at least 2 characters long",
      });
    }

    // Validate required fields if provided
    const requiredFields = [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];
    for (const field of requiredFields) {
      if (
        filteredData.hasOwnProperty(field) &&
        (!filteredData[field] || filteredData[field] === "")
      ) {
        return res.status(400).json({
          success: false,
          error: `${field} is required and cannot be empty`,
        });
      }
    }

    // If setting as default, update other addresses
    if (filteredData.isDefault === true) {
      await adminDb
        .collection("addresses")
        .where("userId", "==", userId)
        .where(adminDb.FieldPath.documentId(), "!=", addressId)
        .get()
        .then((snapshot) => {
          const batch = adminDb.batch();
          snapshot.forEach((doc) => {
            batch.update(doc.ref, { isDefault: false });
          });
          return batch.commit();
        });
    }

    // Add update timestamp
    filteredData.updatedAt = new Date();

    // Update address in Firestore
    await adminDb.collection("addresses").doc(addressId).update(filteredData);

    // Get updated address
    const updatedDoc = await adminDb
      .collection("addresses")
      .doc(addressId)
      .get();
    const updatedData = updatedDoc.data();

    const responseData = {
      id: addressId,
      ...updatedData,
      createdAt:
        updatedData.createdAt?.toDate?.()?.toISOString() ||
        updatedData.createdAt,
      updatedAt:
        updatedData.updatedAt?.toDate?.()?.toISOString() ||
        updatedData.updatedAt,
    };

    return sendSuccess(res, responseData, "Address updated successfully");
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
}
