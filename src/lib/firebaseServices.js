import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, db, storage } from "./firebase";

// ✅ Create Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Authentication Services
export const authService = {
  // Register new user
  async register(userData, role = "buyer") {
    try {
      const { email, password, ...profileData } = userData;

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: profileData.name,
      });

      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        role,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        emailVerified: user.emailVerified,
      };

      // Add role-specific fields
      if (role === "seller") {
        userDoc.businessInfo = {
          businessName: profileData.businessName,
          businessAddress: profileData.businessAddress,
          businessPhone: profileData.businessPhone,
        };
        userDoc.sellerStats = {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          rating: 0,
          reviewCount: 0,
        };
      } else {
        userDoc.addresses = [];
        userDoc.wishlist = [];
      }

      await setDoc(doc(db, "users", user.uid), userDoc);

      // Send verification email
      await sendEmailVerification(user);

      return { success: true, user: userDoc };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return { success: true, user: userData };
      } else {
        throw new Error("User profile not found");
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  },

  // ✅ NEW: Google Sign-In
  async signInWithGoogle() {
    try {
      console.log("Firebase: Starting Google sign-in...");

      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      console.log(
        "Firebase: Google sign-in successful for:",
        firebaseUser.email
      );

      // Check if user profile exists in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let userData;

      if (userDoc.exists()) {
        // Existing user - get their profile
        userData = {
          uid: firebaseUser.uid,
          ...userDoc.data(),
        };
        console.log("Firebase: Existing user found");
      } else {
        // New user - create profile
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "User",
          displayName: firebaseUser.displayName || "User",
          photoURL: firebaseUser.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          emailVerified: firebaseUser.emailVerified,
          addresses: [],
          wishlist: [],
          // Note: role will be set by the auth store based on login page
        };

        // Save new user to Firestore
        await setDoc(userDocRef, userData);
        console.log("Firebase: New user profile created");
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error("Firebase: Google sign-in error:", error);

      // Handle specific error cases
      let errorMessage = "Google sign-in failed. Please try again.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was cancelled.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        errorMessage =
          "An account already exists with this email using a different sign-in method.";
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code,
      };
    }
  },

  // Seller login
  async sellerLogin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid)); // Changed from "seller" to "users"
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verify user is a seller
        if (userData.role !== "seller") {
          await signOut(auth); // Sign out if not a seller
          throw new Error("Access denied. This login is for sellers only.");
        }

        return { success: true, user: userData };
      } else {
        throw new Error("Seller profile not found");
      }
    } catch (error) {
      console.error("Seller login error:", error);
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Auth state listener
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },
};

// User Services
export const userService = {
  // Get user profile
  async getProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid)); // Fixed: changed "user" to "users"
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      console.error("Get profile error:", error);
      return { success: false, error: error.message };
    }
  },

  // Fetch seller profile
  async getSellerProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, "seller", uid)); // Changed from "seller" to "users"
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verify user is a seller
        

        return { success: true, data: userData };
      } else {
        return { success: false, error: "Seller not found" };
      }
    } catch (error) {
      console.error("Get seller profile error:", error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(uid, updates) {
    try {
      await updateDoc(doc(db, "users", uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message };
    }
  },

  // Add address
  async addAddress(uid, address) {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const addresses = userData.addresses || [];

        // Generate address ID
        const addressId = Date.now().toString();
        const newAddress = {
          id: addressId,
          ...address,
          createdAt: new Date(),
        };

        // If this is the first address, make it default
        if (addresses.length === 0) {
          newAddress.isDefault = true;
        }

        addresses.push(newAddress);

        await updateDoc(userRef, { addresses });
        return { success: true, address: newAddress };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      console.error("Add address error:", error);
      return { success: false, error: error.message };
    }
  },
};

// Product Services
export const productService = {
  // Create product
  async createProduct(productData) {
    try {
      const productRef = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        totalSales: 0,
        rating: 0,
        reviewCount: 0,
      });

      return { success: true, id: productRef.id };
    } catch (error) {
      console.error("Create product error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get products with pagination
  async getProducts(filters = {}, lastDoc = null) {
    try {
      let q = collection(db, "products");
      const constraints = [where("isActive", "==", true)];

      // Apply filters
      if (filters.sellerId) {
        constraints.push(where("sellerId", "==", filters.sellerId));
      }

      if (filters.tags && filters.tags.length > 0) {
        constraints.push(where("tags", "array-contains-any", filters.tags));
      }

      if (filters.minPrice) {
        constraints.push(where("price", ">=", filters.minPrice));
      }

      if (filters.maxPrice) {
        constraints.push(where("price", "<=", filters.maxPrice));
      }

      // Add ordering
      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(limit(filters.limit || 20));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);

      const products = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });

      return {
        success: true,
        data: products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error("Get products error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get single product
  async getProduct(id) {
    try {
      const productDoc = await getDoc(doc(db, "products", id));
      if (productDoc.exists()) {
        return {
          success: true,
          data: { id: productDoc.id, ...productDoc.data() },
        };
      } else {
        return { success: false, error: "Product not found" };
      }
    } catch (error) {
      console.error("Get product error:", error);
      return { success: false, error: error.message };
    }
  },

  // Update product
  async updateProduct(id, updates) {
    try {
      await updateDoc(doc(db, "products", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Update product error:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      await deleteDoc(doc(db, "products", id));
      return { success: true };
    } catch (error) {
      console.error("Delete product error:", error);
      return { success: false, error: error.message };
    }
  },
};

// Order Services
export const orderService = {
  // Create order
  async createOrder(orderData) {
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [
          {
            status: "pending",
            timestamp: serverTimestamp(),
            note: "Order placed",
          },
        ],
      });

      return { success: true, id: orderRef.id };
    } catch (error) {
      console.error("Create order error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get orders
  async getOrders(filters = {}) {
    try {
      let q = collection(db, "orders");
      const constraints = [];

      if (filters.buyerId) {
        constraints.push(where("buyerId", "==", filters.buyerId));
      }

      if (filters.sellerId) {
        constraints.push(where("sellerId", "==", filters.sellerId));
      }

      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }

      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(limit(filters.limit || 50));

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);

      const orders = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: orders };
    } catch (error) {
      console.error("Get orders error:", error);
      return { success: false, error: error.message };
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status, notes = "", tracking = "") {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        const statusHistory = orderData.statusHistory || [];

        statusHistory.push({
          status,
          timestamp: serverTimestamp(),
          note: notes,
        });

        const updates = {
          status,
          updatedAt: serverTimestamp(),
          statusHistory,
        };

        if (tracking) {
          updates.tracking = tracking;
        }

        await updateDoc(orderRef, updates);
        return { success: true };
      } else {
        return { success: false, error: "Order not found" };
      }
    } catch (error) {
      console.error("Update order status error:", error);
      return { success: false, error: error.message };
    }
  },
};

// File Upload Services
export const uploadService = {
  // Upload file to Firebase Storage
  async uploadFile(file, path) {
    try {
      const fileRef = ref(storage, path);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return { success: true, url: downloadURL, ref: snapshot.ref };
    } catch (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete file from Firebase Storage
  async deleteFile(path) {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error) {
      console.error("Delete file error:", error);
      return { success: false, error: error.message };
    }
  },
};

export default {
  auth: authService,
  user: userService,
  product: productService,
  order: orderService,
  upload: uploadService,
};
