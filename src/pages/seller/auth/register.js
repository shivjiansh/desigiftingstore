import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { notify } from '../../../lib/notifications';

export default function SellerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers
    };
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateFormData = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
    } else if (formData.businessAddress.trim().length < 10) {
      newErrors.businessAddress = 'Please provide a complete address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must meet all requirements';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the seller terms and conditions';
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
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        businessName: formData.businessName.trim(),
        businessAddress: formData.businessAddress.trim(),
        businessPhone: formData.businessPhone.trim() || formData.phone.trim(),

        // Seller-specific fields
        businessInfo: {
          businessName: formData.businessName.trim(),
          businessAddress: formData.businessAddress.trim(),
          businessPhone: formData.businessPhone.trim() || formData.phone.trim(),
          taxId: '',
          businessType: 'individual',
          isVerified: false
        },

        // Seller statistics
        sellerStats: {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalSales: 0,
          rating: 0,
          reviewCount: 0,
          averageOrderValue: 0
        },

        // Status fields
        isActive: true,
        isVerified: false,
        emailVerified: user.emailVerified,

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Additional seller fields
        description: '',
        logo: '',
        banner: '',
        socialLinks: {
          website: '',
          facebook: '',
          instagram: '',
          twitter: ''
        },

        // Store settings
        storeSettings: {
          processingTime: '3-5 business days',
          shippingPolicies: '',
          returnPolicy: '',
          customOrdersEnabled: true,
          minimumOrderValue: 0
        }
      };

      // Save seller data to Firestore
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
        // Step 5: Send email verification
        //later
        //await sendEmailVerification(user);

        // Step 6: Success feedback and redirect
        notify.success(
          "Seller account created successfully! Verification will take around 24 hrs"
        );
        router.push("/seller/dashboard?welcome=true");
      } else {
        throw new Error(result.error || "API registration failed");
      }

    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }

      setErrors({ general: errorMessage });
      notify.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <>
      <Head>
        <title>Become a Seller - Desigifting</title>
        <meta name="description" content="Join Desigifting as a seller and start your custom gifts business" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-3xl">🎁</span>
              <h1 className="text-2xl font-bold text-gray-900">Desigifting</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your Seller Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of talented sellers and turn your creativity into a thriving business
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
                      className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                    {errors.name && (
                      <p className="form-error">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
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
                  <div>
                    <label htmlFor="businessName" className="form-label">
                      Business Name *
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      className={`form-input ${errors.businessName ? 'form-input-error' : ''}`}
                      placeholder="Enter your business name"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      required
                    />
                    {errors.businessName && (
                      <p className="form-error">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="businessAddress" className="form-label">
                      Business Address *
                    </label>
                    <textarea
                      id="businessAddress"
                      rows={3}
                      className={`form-input ${errors.businessAddress ? 'form-input-error' : ''}`}
                      placeholder="Enter your complete business address"
                      value={formData.businessAddress}
                      onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                      required
                    />
                    {errors.businessAddress && (
                      <p className="form-error">{errors.businessAddress}</p>
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
                      placeholder="Enter business phone (if different from personal)"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    />
                    <p className="form-help">Leave blank to use your personal phone number</p>
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
                      className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
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
                      className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="form-error">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {showPasswordHelp && formData.password && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 mb-2">Password requirements:</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.minLength ? '✓' : '○'}</span>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                        One uppercase letter
                      </div>
                      <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                        One lowercase letter
                      </div>
                      <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasNumbers ? '✓' : '○'}</span>
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
                    className={`w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500 mt-1 ${errors.agreeToTerms ? 'border-red-300' : ''}`}
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    required
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/seller-terms" className="text-accent-600 hover:text-accent-700">
                      Seller Terms of Service
                    </Link>,{' '}
                    <Link href="/privacy" className="text-accent-600 hover:text-accent-700">
                      Privacy Policy
                    </Link>, and understand the{' '}
                    <Link href="/seller-fees" className="text-accent-600 hover:text-accent-700">
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
                disabled={isLoading}
                className="btn bg-accent-600 hover:bg-accent-700 text-white w-full btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Creating seller account...</span>
                  </div>
                ) : (
                  'Start Selling on Desigifting'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/seller/auth/login" className="text-accent-600 hover:text-accent-700 font-medium">
                  Sign in to your seller account
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Creative Freedom</h3>
              <p className="text-sm text-gray-600">
                Design and sell your unique custom products with complete creative control
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profitable Pricing</h3>
              <p className="text-sm text-gray-600">
                Set your own prices and keep 85% of every sale with transparent fees
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Built-in Marketing</h3>
              <p className="text-sm text-gray-600">
                Reach thousands of buyers through our marketplace and marketing tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
