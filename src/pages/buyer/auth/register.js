import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth, useGuestOnly } from '../../../hooks/useAuth';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { validateForm, buyerRegistrationSchema, validatePassword } from '../../../lib/validators';

export default function BuyerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const { register, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useGuestOnly('/products');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateFormData = () => {
    // Basic validation using schema
    const { isValid: schemaValid, errors: schemaErrors } = validateForm(formData, buyerRegistrationSchema);

    let newErrors = { ...schemaErrors };

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
      password: formData.password
    };

    const result = await register(userData, 'buyer');

    if (result.success) {
      router.push('/products?welcome=true');
    } else {
      setErrors({ general: result.error || 'Registration failed. Please try again.' });
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <>
      <Head>
        <title>Create Buyer Account - Desigifting</title>
        <meta name="description" content="Join Desigifting as a buyer and discover unique customized gifts" />
      </Head>

      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-12 bg-white">
          <div className="mx-auto w-full max-w-sm">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-3xl">🎁</span>
                <h1 className="text-2xl font-bold text-gray-900">Desigifting</h1>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create your account
              </h2>
              <p className="text-gray-600 mb-8">
                Already have an account?{' '}
                <Link href="/buyer/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>

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
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                {errors.phone && (
                  <p className="form-error">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setShowPasswordHelp(true)}
                  onBlur={() => setShowPasswordHelp(false)}
                />
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}

                {showPasswordHelp && formData.password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 mb-2">Password requirements:</p>
                    <div className="space-y-1 text-xs">
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

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    className={`w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1 ${errors.agreeToTerms ? 'border-red-300' : ''}`}
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
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
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Want to sell custom gifts?{' '}
                <Link href="/seller/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Become a Seller
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-500 to-secondary-700 flex-col justify-center px-12">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-8">
              <span className="text-4xl">🎁</span>
              <h1 className="text-3xl font-bold">Join Desigifting</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Start Your Gift Journey
            </h2>
            <p className="text-secondary-100 text-lg leading-relaxed mb-8">
              Discover thousands of unique, customizable gifts and connect with talented artisans worldwide.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">🎨</div>
                <span>Personalize any gift with your photos & text</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">🚚</div>
                <span>Fast delivery with tracking included</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">💯</div>
                <span>100% satisfaction guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">💬</div>
                <span>Direct communication with sellers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
