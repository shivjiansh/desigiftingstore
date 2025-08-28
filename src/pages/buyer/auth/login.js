import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth, useGuestOnly } from '../../../hooks/useAuth';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { validateEmail } from '../../../lib/validators';

export default function BuyerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuth();
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData.email, formData.password, 'buyer');

    if (result.success) {
      const redirectTo = router.query.redirect || '/products';
      router.push(redirectTo);
    } else {
      setErrors({ general: result.error || 'Login failed. Please try again.' });
    }
  };

  return (
    <>
      <Head>
        <title>Buyer Login - Desigifting</title>
        <meta name="description" content="Login to your Desigifting buyer account" />
      </Head>

      <div className="min-h-screen flex">
        {/* Left side - Image/Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 flex-col justify-center px-12">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-8">
              <span className="text-4xl">🎁</span>
              <h1 className="text-3xl font-bold">Desigifting</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Welcome back!
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed mb-8">
              Continue your journey of creating unique, personalized gifts. 
              Discover amazing custom products from talented sellers worldwide.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">✓</div>
                <span>Thousands of unique products</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">✓</div>
                <span>Fast & secure checkout</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">✓</div>
                <span>Order tracking included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
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
                Sign in to your account
              </h2>
              <p className="text-gray-600 mb-8">
                Don't have an account?{' '}
                <Link href="/buyer/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Create one now
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
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Want to sell custom gifts?{' '}
                  <Link href="/seller/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Seller Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
