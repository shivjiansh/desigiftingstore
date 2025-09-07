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
import { signInWithGoogle } from "../../../lib/firebaseServices";
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
        <title>Seller Login - DesiGifting | Your Art, Your Rules</title>
        <meta
          name="description"
          content="Login to your DesiGifting seller account. Manage your custom gifts business and start earning today."
        />
      </Head>

      <div className="min-h-screen flex bg-gray-50">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-12 flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-32 w-16 h-16 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-md">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-4 group px-4">
                          <div className="relative">
                            <Image
                              src="/images/logo1.png"
                              alt="DesiGifting Logo"
                              width={54}
                              height={54}
                              className="rounded-2xl shadow-lg object-contain transition-all duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/8 to-purple-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="text-left">
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-none">
                              DesiGifting
                            </h1>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <div className="w-4 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full"></div>
                              <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
                                Make It Personal
                              </span>
                            </div>
                          </div>
                        </div>

            {/* Hero Content */}
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Welcome Back, Creator
            </h1>
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Ready to grow your custom gifts empire? Your dashboard awaits.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="text-white font-semibold">85% Profit Share</p>
                  <p className="text-indigo-200 text-sm">
                    Keep more of what you earn
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    50,000+ Active Buyers
                  </p>
                  <p className="text-indigo-200 text-sm">
                    Ready to purchase your designs
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Instant Setup</p>
                  <p className="text-indigo-200 text-sm">
                    Launch products in minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="border-t border-white/20 pt-6">
              <blockquote className="text-indigo-100 text-lg italic mb-2">
                "DesiGifting transformed my hobby into a ₹1L+ monthly business!"
              </blockquote>
              <cite className="text-white/80 text-sm font-medium">
                — Rahul K, Top Seller
              </cite>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4 group px-4">
                            <div className="relative">
                              <Image
                                src="/images/logo1.png"
                                alt="DesiGifting Logo"
                                width={54}
                                height={54}
                                className="rounded-2xl shadow-lg object-contain transition-all duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/8 to-purple-600/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="text-left">
                              <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-none">
                                DesiGifting
                              </h1>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <div className="w-5 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full"></div>
                                <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
                                  Store Dashboard
                                </span>
                              </div>
                            </div>
                          </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-gray-600">
                Don't have a seller account?{" "}
                <Link
                  href="/seller/auth/register"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Start selling today 
                </Link>
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                      <span className="text-red-400 mr-3">⚠️</span>
                      <p className="text-red-800 text-sm font-medium">
                        {errors.general}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        handleInputChange("rememberMe", e.target.checked)
                      }
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Keep me signed in
                    </span>
                  </label>
                  <Link
                    href="/seller/auth/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" color="white" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </button>
              </form>

              {/* Divider */}
            
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Looking to buy gifts?{" "}
                <Link
                  href="/buyer/auth/login"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Buyer Login
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
