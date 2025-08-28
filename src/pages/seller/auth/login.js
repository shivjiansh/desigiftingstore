// src/pages/seller/auth/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { notify } from "../../../lib/notifications";

export default function SellerLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );
      const user = userCredential.user;

      // 2. Fetch seller profile directly from Firestore
      const sellerDocRef = doc(db, "seller", user.uid);
      const sellerDocSnap = await getDoc(sellerDocRef);

      if (!sellerDocSnap.exists()) {
        throw new Error("Seller profile not found. Contact support.");
      }
      const sellerData = sellerDocSnap.data();

      // 4. Success: redirect
      notify.success(
        `Welcome back, ${sellerData.name || sellerData.businessName}!`
      );
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Seller login error:", error);
      let errorMessage = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-disabled":
          errorMessage = "Account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Try later.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      setErrors({ general: errorMessage });
      notify.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Seller Login - Desigifting</title>
        <meta
          name="description"
          content="Login to your Desigifting seller account"
        />
      </Head>

      <div className="min-h-screen flex">
        {/* Branding side */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 to-accent-700 flex-col justify-center px-12">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-8">
              <span className="text-4xl">🎁</span>
              <h1 className="text-3xl font-bold">Desigifting</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Welcome back, Creator!
            </h2>
            <p className="text-accent-100 text-lg leading-relaxed">
              Manage your store, track orders, and grow your custom gifts
              business.
            </p>
          </div>
        </div>

        {/* Login form side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-12 bg-white">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Seller Login
            </h2>
            <p className="text-gray-600 mb-8">
              Don't have a seller account?{" "}
              <Link
                href="/seller/auth/register"
                className="text-accent-600 hover:text-accent-700 font-medium"
              >
                Register here
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm flex items-center">
                    <span className="mr-2">⚠️</span>
                    {errors.general}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${
                    errors.email ? "form-input-error" : ""
                  }`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-input ${
                    errors.password ? "form-input-error" : ""
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn bg-accent-600 hover:bg-accent-700 text-white w-full disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-8 text-sm text-gray-600 text-center">
              Want to buy gifts?{" "}
              <Link
                href="/buyer/auth/login"
                className="text-primary-600 hover:text-primary-700"
              >
                Buyer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
