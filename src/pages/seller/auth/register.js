import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { notify } from "../../../lib/notifications";
// ❌ Removed: import emailService from "../../../lib/emailService";

export default function SellerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessPhone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    gstNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
    };
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };
  const canSubmit = formData.agreeToTerms && !isLoading;


  const validateFormData = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Please enter a valid 6-digit PIN code";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = "Password must meet all requirements";
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "You must agree to the seller terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) return;

    setIsLoading(true);

    try {
      // Create user account with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );
      const user = userCredential.user;

      // Prepare seller data for Firestore
      const sellerData = {
        uid: user.uid,
        email: user.email,
        isEmailVerified: false,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        isPhoneVerified: false,
        role: "seller",

        // Seller-specific fields
        businessInfo: {
          businessName: formData.businessName.trim(),
          tagline: formData.businessInfo?.tagline,
          description: formData.businessInfo?.description,
          businessPhone: formData.businessPhone.trim() || formData.phone.trim(),
          address: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            country: formData.country?.trim() || "India",
          },
          businessType: "individual",
          badge: {
            isVerified: false,
            isToprated: false,
            isShipper: false,
            isAged: false,
            isTrusted: false,
            isPowerSeller: false,
            isBestSeller: false,
            isCustomerFav: false,
          },
          logo: "",
          banner: "",
          gstNumber: formData.gstNumber.trim(),
        },

        // Seller bankInfo
        bankInfo: {
          accountHolderName: "",
          accountNumber: "",
          bankName: "",
          ifscCode: "",
        },

        // Seller statistics
        sellerStats: {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalSales: 0,
          maxSalesInMonth: 0,
          ratings: {
            average: 0,
            total: 0,
            breakdown: {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0,
            },
          },
          averageOrderValue: 0,
        },

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Additional seller fields
        socialLinks: {
          website: "",
          facebook: "",
          instagram: "",
          twitter: "",
        },

        // Store settings
        storeSettings: {
          processingTime: "3-5 business days",
          shippingPolicies: "",
          returnPolicy: "",
          customOrdersEnabled: true,
          minimumOrderValue: 0,
          isActive: true,
        },
      };

      // Save seller data to Firestore via API
      const response = await fetch("/api/seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(sellerData),
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Send seller onboarding email via API route
        try {
          const emailResponse = await fetch("/api/email/send-onboarding", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: formData.name.trim(),
              businessName: formData.businessName.trim(),
              userType: "seller",
            }),
          });

          const emailResult = await emailResponse.json();

          if (emailResult.success) {
            console.log("✅ Seller onboarding email sent successfully");
          } else {
            console.error(
              "⚠️ Failed to send onboarding email:",
              emailResult.error
            );
          }
        } catch (emailError) {
          console.error("⚠️ Onboarding email API error:", emailError);
          // Don't fail registration if email fails
        }

        // Success feedback and redirect
        notify.success(
          "Seller account created successfully! Check your email for next steps. Verification will take around 24 hrs"
        );
        router.push("/seller/dashboard?welcome=true");
      } else {
        throw new Error(result.error || "API registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "Registration failed. Please try again.";

      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please choose a stronger password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/operation-not-allowed":
          errorMessage =
            "Email/password accounts are not enabled. Please contact support.";
          break;
        default:
          errorMessage =
            error.message || "Registration failed. Please try again.";
      }

      setErrors({ general: errorMessage });
      notify.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  // Indian states for dropdown
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu & Kashmir",
    "Ladakh",
  ];

  return (
    <>
      <Head>
        <title>Become a Seller - Desigifting</title>
        <meta
          name="description"
          content="Join Desigifting as a seller and start your custom gifts business"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
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
                    Store Onboarding
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sell More. Keep 100%.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              
              <span className="text-red-600 font-bold">Zero Commission</span>{" "}-
              Limited Time Offer!!!
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm flex items-center">
                    <span className="mr-2">⚠️</span>
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      className={`form-input ${
                        errors.name ? "form-input-error" : ""
                      }`}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`form-input ${
                        errors.email ? "form-input-error" : ""
                      }`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      className={`form-input ${
                        errors.phone ? "form-input-error" : ""
                      }`}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      required
                    />
                    {errors.phone && (
                      <p className="form-error">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Business Information
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="businessName" className="form-label">
                        Business Name *
                      </label>
                      <input
                        id="businessName"
                        type="text"
                        className={`form-input ${
                          errors.businessName ? "form-input-error" : ""
                        }`}
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={(e) =>
                          handleInputChange("businessName", e.target.value)
                        }
                        required
                      />
                      {errors.businessName && (
                        <p className="form-error">{errors.businessName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="businessPhone" className="form-label">
                        Business Phone (Optional)
                      </label>
                      <input
                        id="businessPhone"
                        type="tel"
                        className="form-input"
                        placeholder="Business phone (if different)"
                        value={formData.businessPhone}
                        onChange={(e) =>
                          handleInputChange("businessPhone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="street" className="form-label">
                      Street Address *
                    </label>
                    <input
                      id="street"
                      type="text"
                      className={`form-input ${
                        errors.street ? "form-input-error" : ""
                      }`}
                      placeholder="House/Flat No., Building, Street, Area"
                      value={formData.street}
                      onChange={(e) =>
                        handleInputChange("street", e.target.value)
                      }
                      required
                    />
                    {errors.street && (
                      <p className="form-error">{errors.street}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="city" className="form-label">
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        className={`form-input ${
                          errors.city ? "form-input-error" : ""
                        }`}
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        required
                      />
                      {errors.city && (
                        <p className="form-error">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="form-label">
                        State *
                      </label>
                      <select
                        id="state"
                        className={`form-input ${
                          errors.state ? "form-input-error" : ""
                        }`}
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        required
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="form-error">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="pincode" className="form-label">
                        PIN Code *
                      </label>
                      <input
                        id="pincode"
                        type="text"
                        className={`form-input ${
                          errors.pincode ? "form-input-error" : ""
                        }`}
                        placeholder="6-digit PIN code"
                        value={formData.pincode}
                        onChange={(e) =>
                          handleInputChange("pincode", e.target.value)
                        }
                        maxLength={6}
                        required
                      />
                      {errors.pincode && (
                        <p className="form-error">{errors.pincode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gstNumber" className="form-label">
                      GST Number (Optional)
                    </label>
                    <input
                      id="gstNumber"
                      type="text"
                      className="form-input"
                      placeholder="Enter GST number if registered"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        handleInputChange("gstNumber", e.target.value)
                      }
                    />
                    <p className="form-help text-xs text-gray-500 mt-1">
                      Required if your annual turnover exceeds ₹20 lakhs
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Account Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className={`form-input ${
                        errors.password ? "form-input-error" : ""
                      }`}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onFocus={() => setShowPasswordHelp(true)}
                      onBlur={() => setShowPasswordHelp(false)}
                      required
                    />
                    {errors.password && (
                      <p className="form-error">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`form-input ${
                        errors.confirmPassword ? "form-input-error" : ""
                      }`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="form-error">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {showPasswordHelp && formData.password && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 mb-2">
                      Password requirements:
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
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

              {/* Terms Agreement */}
              <div>
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    className={`w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500 mt-1 ${
                      errors.agreeToTerms ? "border-red-300" : ""
                    }`}
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      handleInputChange("agreeToTerms", e.target.checked)
                    }
                    required
                  />
                  <label
                    htmlFor="agreeToTerms"
                    className="ml-2 text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <Link
                      href="/seller-terms"
                      className="text-accent-600 hover:text-accent-700"
                    >
                      Seller Terms of Service
                    </Link>
                    ,{" "}
                    <Link
                      href="/privacy"
                      className="text-accent-600 hover:text-accent-700"
                    >
                      Privacy Policy
                    </Link>
                    , and understand the{" "}
                    <Link
                      href="/seller-fees"
                      className="text-accent-600 hover:text-accent-700"
                    >
                      Fee Structure
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="form-error mt-1">{errors.agreeToTerms}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn bg-accent-500 hover:bg-accent-700 text-white w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Creating seller account...</span>
                  </div>
                ) : (
                  "Start Selling with Desigifting"
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center mb-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/seller/auth/login"
                className="text-accent-600 hover:text-accent-700 font-medium"
              >
                Sign in to your seller account
              </Link>
            </p>
          </div>

          {/* Benefits Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="text-center px-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">
                Your Art, Your Earnings
              </h3>

              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>Zero joining fee</span>
                </li>

                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>Zero commission & zero platform margin</span>
                </li>

                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>You keep 100% of your profit</span>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="text-center px-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">
                Weekly Payouts, Full Control
              </h3>

              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>Fast weekly payouts directly to your bank</span>
                </li>

                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>No hidden charges or deductions</span>
                </li>

                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>Total transparency & financial freedom</span>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="text-center px-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">
                Promote & Grow Faster
              </h3>

              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>Share your store link to reach more buyers</span>
                </li>

                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>More visibility = more orders & sales</span>
                </li>

                <li className="flex items-start justify-center gap-2">
                  <span>✔</span>
                  <span>We support your growth at every step</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
