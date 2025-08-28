import { adminDb } from "../../../../lib/firebaseAdmin";
import {
  verifyAuthToken,
  handleError,
  sendSuccess,
  methodNotAllowed,
  sanitizeInput,
} from "../../utils";

export default async function handler(req, res) {
  const { method } = req;

  try {
    // All profile operations require authentication
    const decodedToken = await verifyAuthToken(req);

    switch (method) {
      case "POST":
        await handleCreateAddress(req, res, decodedToken);
        break;
      case "GET":
        await handleGetProfile(req, res, decodedToken);
        break;
      case "PUT":
        await handleUpdateProfile(req, res, decodedToken);
        break;
      default:
        methodNotAllowed(res, ["GET", "PUT"]);
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function handleCreateAddress(req, res, decodedToken) {
  try {
    const userId = decodedToken.uid;
    const addressData = sanitizeInput(req.body);
    console.log("Creating address for user:", userId, addressData);

    // Validate required fields…
    const requiredFields = [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];
    for (const field of requiredFields) {
      if (!addressData[field]?.trim()) {
        return res
          .status(400)
          .json({ success: false, error: `${field} is required` });
      }
    }
    // pincode validation
    
    // phone validation
    const phoneRegex = /^[+]?[1-9][0-9\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(addressData.phone)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid phone number format" });
    }
    if (addressData.name.trim().length < 2) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Name must be at least 2 characters long",
        });
    }
    console.log("Validation passed");
    // Fetch user doc
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    console.log("User snapshot:", userSnap.exists);
    if (!userSnap.exists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    console.log("User data:", userSnap.data());
    const userData = userSnap.data();
    const existingAddresses = Array.isArray(userData.addresses)
      ? userData.addresses
      : [];

    if (existingAddresses.length >= 10) {
      return res.status(400).json({
        success: false,
        error: "You can have maximum 10 addresses. Delete one first.",
      });
    }

    // Build new address object
    const newAddress = {
      id: adminDb.collection("_temp").doc().id, // generate unique ID
        ...addressData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If first address, force default
    if (existingAddresses.length === 0) {
      newAddress.isDefault = true;
    }

    // If new address is default, clear existing
    const updatedAddresses = existingAddresses.map((addr) => ({
      ...addr,
      isDefault: newAddress.isDefault ? false : addr.isDefault,
    }));

    updatedAddresses.push(newAddress);

    // Update user document
    await userRef.update({
      addresses: updatedAddresses,
      "stats.totalAddresses": updatedAddresses.length,
      updatedAt: new Date(),
    });

    return sendSuccess(res, newAddress, "Address added to user profile", 201);
  } catch (error) {
    console.error("Error adding address to user:", error);
    throw error;
  }
}

async function handleGetProfile(req, res, decodedToken) {
  try {
    console.log("galyt wala fun");
    const userId = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();
    //nouserdoc found redirect to login
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    let profileData = {};

    if (userDoc.exists) {
      profileData = userDoc.data();
     //fetch addresses
        profileData.addresses = Array.isArray(profileData.addresses)
            ? profileData.addresses
            : [];

      
    }

    // send fetched addresses
    console.log("Profile data:", profileData.address);
    
   

    // Update last seen


    return sendSuccess(
      res,
      profileData.addresses,
      "Addresses retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

async function handleUpdateProfile(req, res, decodedToken) {
  try {
    const userId = decodedToken.uid;
    const updateData = sanitizeInput(req.body);

    // Fields that can be updated
    const allowedFields = [
      "displayName",
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "gender",
      "bio",
      "photoURL",
      "address",
      "preferences",
      "social",
      "website",
    ];

    // Filter only allowed fields
    const filteredData = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    // Add update timestamp
    filteredData.updatedAt = new Date();

    // Validate specific fields
    if (filteredData.phone) {
      const phoneRegex = /^[+]?[1-9][\d\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(filteredData.phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone number format",
        });
      }
    }

    if (filteredData.email) {
      return res.status(400).json({
        success: false,
        error: "Email cannot be updated through this endpoint",
      });
    }

    if (filteredData.dateOfBirth) {
      const birthDate = new Date(filteredData.dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Invalid date of birth format",
        });
      }

      // Check if user is at least 13 years old
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);

      if (birthDate > minAge) {
        return res.status(400).json({
          success: false,
          error: "User must be at least 13 years old",
        });
      }
    }

    if (filteredData.displayName && filteredData.displayName.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Display name must be at least 2 characters long",
      });
    }

    // Update profile in Firestore
    await adminDb.collection("users").doc(userId).update(filteredData);

    // Get updated profile
    const updatedDoc = await adminDb.collection("users").doc(userId).get();
    const updatedData = updatedDoc.data();

    // Remove sensitive information
    const { password, ...safeUpdatedData } = updatedData;

    // Convert timestamps
    safeUpdatedData.createdAt =
      safeUpdatedData.createdAt?.toDate?.()?.toISOString() ||
      safeUpdatedData.createdAt;
    safeUpdatedData.updatedAt =
      safeUpdatedData.updatedAt?.toDate?.()?.toISOString() ||
      safeUpdatedData.updatedAt;

    return sendSuccess(res, safeUpdatedData, "Profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error.code === "not-found") {
      return res.status(404).json({
        success: false,
        error: "User profile not found",
      });
    }

    throw error;
  }
}
