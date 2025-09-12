import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth, useGuestOnly } from "../../../hooks/useAuth";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  validateForm,
  buyerRegistrationSchema,
  validatePassword,
} from "../../../lib/validators";
import Image from "next/image";

export default function BuyerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { register, isLoading } = useAuth();
  const router = useRouter();

  useGuestOnly("/products");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateFormData = () => {
    const { isValid: schemaValid, errors: schemaErrors } = validateForm(
      formData,
      buyerRegistrationSchema
    );
    let newErrors = { ...schemaErrors };

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormData()) return;

    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    const result = await register(userData, "buyer");

    if (result.success) {
      setVerificationSent(true);
      // Auto-redirect after 10 seconds, or user can click button
      setTimeout(() => {
        if (verificationSent) {
          router.push("/products?welcome=true");
        }
      }, 1000000);
    } else {
      setErrors({
        general: result.error || "Registration failed. Please try again.",
      });
    }
  };

  const handleResendVerification = async () => {
    // Call API to resend verification email
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        alert("Verification email sent again!");
      }
    } catch (error) {
      console.error("Failed to resend verification:", error);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <>
      <Head>
        <title>
          Create Buyer Account - DesiGifting | Discover Unique Gifts
        </title>
        <meta
          name="description"
          content="Join DesiGifting as a buyer and discover unique customized gifts from talented creators"
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
              Discover Unique Gifts
            </h1>
            <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
              Find one-of-a-kind customized gifts crafted with love by talented
              creators.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">🎨</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    Personalized Everything
                  </p>
                  <p className="text-emerald-200 text-sm">
                    Add photos, text, and custom designs
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">🚚</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    Fast & Secure Delivery
                  </p>
                  <p className="text-emerald-200 text-sm">
                    Track your order every step of the way
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

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex items-center justify-center space-x-3 mb-4 group px-4 lg:hidden">
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
                Create your account
              </h2>
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/buyer/auth/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Registration Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              {verificationSent ? (
                <div className="text-center space-y-6">
                  {/* Success Icon */}
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📧</span>
                  </div>

                  {/* Success Message */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Check Your Email!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We've sent a verification link to:
                    </p>
                    <p className="font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                      {formData.email}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Next Steps:
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the verification link in the email</li>
                      <li>Return here to sign in and start shopping</li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/products?welcome=true")}
                      className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Continue to Products
                    </button>

                    <button
                      onClick={handleResendVerification}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      Didn't receive email? Resend verification
                    </button>
                  </div>

                  {/* Auto-redirect notice */}
                  <p className="text-xs text-gray-500">
                    You'll be automatically redirected to products in 10 seconds
                  </p>
                </div>
              ) : (
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
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.name
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-emerald-500"
                      }`}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.name}
                      </p>
                    )}
                  </div>

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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.phone
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-emerald-500"
                      }`}
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.phone}
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
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-emerald-500"
                      }`}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onFocus={() => setShowPasswordHelp(true)}
                      onBlur={() => setShowPasswordHelp(false)}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.password}
                      </p>
                    )}

                    {showPasswordHelp && formData.password && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-600 mb-2">
                          Password requirements:
                        </p>
                        <div className="space-y-1 text-xs">
                          <div
                            className={`flex items-center ${
                              passwordValidation.minLength
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <span className="mr-2">
                              {passwordValidation.minLength ? "✓" : "○"}
                            </span>
                            At least 8 characters
                          </div>
                          <div
                            className={`flex items-center ${
                              passwordValidation.hasUpperCase
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <span className="mr-2">
                              {passwordValidation.hasUpperCase ? "✓" : "○"}
                            </span>
                            One uppercase letter
                          </div>
                          <div
                            className={`flex items-center ${
                              passwordValidation.hasLowerCase
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <span className="mr-2">
                              {passwordValidation.hasLowerCase ? "✓" : "○"}
                            </span>
                            One lowercase letter
                          </div>
                          <div
                            className={`flex items-center ${
                              passwordValidation.hasNumbers
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <span className="mr-2">
                              {passwordValidation.hasNumbers ? "✓" : "○"}
                            </span>
                            One number
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.confirmPassword
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-emerald-500"
                      }`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        checked={formData.agreeToTerms}
                        onChange={(e) =>
                          handleInputChange("agreeToTerms", e.target.checked)
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.agreeToTerms}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-200 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <LoadingSpinner size="sm" color="white" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create My Account"
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer Links */}
            {!verificationSent && (
              <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Want to sell custom gifts?{" "}
                  <Link
                    href="/seller/auth/register"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    Become a Seller
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{" "}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
