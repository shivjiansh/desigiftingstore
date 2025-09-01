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
import { signInWithGoogle } from "../../../lib/firebaseServices"; // import your Google sign-in service
import Image from "next/image";

export default function SellerLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrors({});
    try {
      const result = await signInWithGoogle("seller");
      if (result.success) {
        notify.success(
          `Welcome back, ${result.user.name || result.user.displayName}!`
        );
        router.push("/seller/dashboard");
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      notify.error(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );
      const user = userCredential.user;
      const sellerDoc = await getDoc(doc(db, "users", user.uid));
      if (!sellerDoc.exists() || sellerDoc.data().role !== "seller") {
        throw new Error("Seller profile not found. Contact support.");
      }
      const sellerData = sellerDoc.data();
      notify.success(
        `Welcome back, ${sellerData.name || sellerData.businessName}!`
      );
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Seller login error:", error);
      const code = error.code;
      let message = "Login failed. Please try again.";
      if (code === "auth/user-not-found" || code === "auth/wrong-password")
        message = "Invalid email or password.";
      else if (code === "auth/invalid-email") message = "Invalid email format.";
      else if (code === "auth/user-disabled")
        message = "Account has been disabled.";
      else if (code === "auth/too-many-requests")
        message = "Too many attempts. Try again later.";
      else if (error.message) message = error.message;
      setErrors({ general: message });
      notify.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Seller Login - DesiGifting</title>
        <meta
          name="description"
          content="Login to your DesiGifting seller account"
        />
      </Head>

      <div className="min-h-screen flex">
        {/* Left branding side */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 flex-col justify-center px-12">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-8">
              <span className="text-4xl">🎁</span>
              <h1 className="text-3xl font-bold">DesiGifting</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Welcome back, Creator!
            </h2>
            <p className="text-purple-200 text-lg leading-relaxed">
              Manage your store, track orders, and grow your custom gifts
              business.
            </p>
          </div>
        </div>

        {/* Right form side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-12 bg-white">
          <div className="mx-auto w-full max-w-sm">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-3xl">🎁</span>
                <h1 className="text-2xl font-bold text-gray-900">
                  DesiGifting
                </h1>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Seller Login
            </h2>
            <p className="text-gray-600 mb-8">
              Don't have a seller account?{" "}
              <Link
                href="/seller/auth/register"
                className="text-purple-600 hover:text-purple-700 font-medium"
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
                />
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn bg-purple-600 hover:bg-purple-700 text-white w-full disabled:opacity-50"
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
                className="text-indigo-600 hover:text-indigo-700"
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
