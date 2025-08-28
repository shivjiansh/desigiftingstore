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

async function handleGetProfile(req, res, decodedToken) {
  try {
    const userId = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();

    let profileData = {};

    if (userDoc.exists) {
      profileData = userDoc.data();
    } else {
      // Create basic profile if doesn't exist
      profileData = {
        uid: userId,
        email: decodedToken.email,
        displayName: decodedToken.name || "",
        role: "buyer",
        isActive: true,
        preferences: {
          language: "en",
          currency: "INR",
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the new profile
      await adminDb.collection("users").doc(userId).set(profileData);
    }

    // Remove sensitive information
    const { password, ...safeProfileData } = profileData;

    // Convert Firestore timestamps
    safeProfileData.createdAt =
      safeProfileData.createdAt?.toDate?.()?.toISOString() ||
      safeProfileData.createdAt;
    safeProfileData.updatedAt =
      safeProfileData.updatedAt?.toDate?.()?.toISOString() ||
      safeProfileData.updatedAt;
    safeProfileData.lastLoginAt =
      safeProfileData.lastLoginAt?.toDate?.()?.toISOString() ||
      safeProfileData.lastLoginAt;

    // Update last seen
    await adminDb.collection("users").doc(userId).update({
      lastSeenAt: new Date(),
    });

    return sendSuccess(res, safeProfileData, "Profile retrieved successfully");
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
