import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const [user] = useAuthState(auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out");
      router.push("/products");
    } catch {
      toast.error("Error signing out");
    }
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/products" className="flex items-center space-x-2">
            <div className="w-10 h-10 relative overflow-hidden rounded-lg">
              <Image
                src="/images/logo1.png"
                alt="DesiGifting Logo"
                width={100}
                height={100}
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="text-2xl font-bold text-gray-700 tracking-tight leading-none">
              DesiGifting
            </span>
          </Link>

          {/* Desktop nav */}
          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-8">
            {user ? (
              // Logged in navigation
              <>
                <Link
                  href="/wishlist"
                  className="text-gray-900 hover:text-emerald-600 font-semibold transition-colors duration-200"
                >
                  Wishlist
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-900 hover:text-emerald-600 font-semibold transition-colors duration-200"
                >
                  Orders
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-900 hover:text-emerald-600 font-semibold transition-colors duration-200"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-900 hover:text-emerald-600 font-semibold transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Logged out navigation
              <>
                <Link
                  href="/products"
                  className="text-gray-900 hover:text-emerald-600 font-semibold transition-colors duration-200"
                >
                  Browse Products
                </Link>
                <Link
                  href="/sellers"
                  className="text-gray-900 hover:text-emerald-600 font-semibold transition-colors duration-200"
                >
                  Partnered Stores
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-emerald-600 justify-between"
                >
                  {user.photoURL ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.displayName?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                  )}

                  <span className="font-medium">
                    {user.displayName
                      ? user.displayName.split(" ")[0]
                      : "Buyer"}
                  </span>
                </button>
                
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/buyer/auth/login"
                  className="text-gray-600 hover:text-emerald-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/buyer/auth/login"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden text-gray-600 hover:text-emerald-600"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t">
          <div className="px-10 py-2 space-y-1">
            <Link
              href="/products"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Browse Products</span>
            </Link>

            <Link
              href="/sellers"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Partnered Stores</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Orders</span>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Wishlist</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full text-left px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/buyer/auth/login"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Login</span>
                </Link>

                <Link
                  href="/buyer/auth/login"
                  className="flex items-center justify-center space-x-3 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
