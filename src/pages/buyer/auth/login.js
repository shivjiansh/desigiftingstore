import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth, useGuestOnly } from "../../../hooks/useAuth";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { validateEmail } from "../../../lib/validators";
import Image from "next/image";

export default function BuyerLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, signInWithGoogle, isLoading } = useAuth();
  const router = useRouter();

  useGuestOnly("/products");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await login(formData.email, formData.password, "buyer");
    if (result.success) {
      const redirectTo = router.query.redirect || "/products";
      router.push(redirectTo);
    } else {
      setErrors({ general: result.error || "Login failed. Please try again." });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      const result = await signInWithGoogle("buyer");
      if (result.success) {
        const redirectTo = router.query.redirect || "/products";
        router.push(redirectTo);
      } else {
        setErrors({
          general: result.error || "Google sign in failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Google sign in failed. Please try again." });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Buyer Login - DesiGifting | Discover Unique Gifts</title>
        <meta
          name="description"
          content="Login to your DesiGifting buyer account and discover unique customized gifts"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <div className="min-h-screen flex bg-gray-50">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 flex-col justify-center relative overflow-hidden">
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
                                make it personal
                              </span>
                            </div>
                          </div>
                        </div>

            {/* Hero Content */}
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Welcome Back!
            </h1>
            <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
              Continue your journey of creating unique, personalized gifts.
              Discover amazing custom products from talented sellers.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">🎨</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    Thousands of Unique Products
                  </p>
                  <p className="text-emerald-200 text-sm">
                    Find the perfect personalized gift
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">🚚</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    Fast & Secure Checkout
                  </p>
                  <p className="text-emerald-200 text-sm">
                    Safe payment with order tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">💯</span>
                </div>
                <div>
                  <p className="text-white font-semibold">100% Satisfaction</p>
                  <p className="text-emerald-200 text-sm">
                    Love it or get your money back
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="border-t border-white/20 pt-6">
              <blockquote className="text-emerald-100 text-lg italic mb-2">
                "Found the perfect personalized gift for my daughter's
                birthday!"
              </blockquote>
              <cite className="text-white/80 text-sm font-medium">
                — Priya M, Happy Customer
              </cite>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
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
                               make it personal
                             </span>
                           </div>
                         </div>
                       </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/buyer/auth/register"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Create one now →
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
                    autoComplete="email"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:border-emerald-500"
                    }`}
                    placeholder="your@email.com"
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
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:border-emerald-500"
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
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
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
                    href="/buyer/auth/forgot-password"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-200 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" color="white" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In to Continue"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all duration-200 disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <LoadingSpinner size="sm" color="gray" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Want to sell custom gifts?{" "}
                <Link
                  href="/seller/auth/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Seller Login
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-emerald-600 hover:text-emerald-700"
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
