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
  // Remove UserIcon import
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
      router.push("/");
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
            <span className="text-xl font-bold text-grey-400">
              DesiGifting
            </span>
          </Link>

          {/* Desktop nav */}
        
          <nav className="hidden md:flex space-x-8">
            {/* ... nav links ... */}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-indigo-600 justify-between"
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
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  )}
                  <span className="font-medium">
                    {user.displayName
                      ? user.displayName.split(" ")[0]
                      : "Account"}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Wishlist
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/buyer/auth/login"
                  className="text-gray-600 hover:text-indigo-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/buyer/auth/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden text-gray-600 hover:text-indigo-600"
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
          <div className="px-4 py-2 space-y-1">
             {" "}
            <Link
              href="/products"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
                            Products            {" "}
            </Link>
                       {" "}
            <Link
              href="/sellers"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
                            Partners            {" "}
            </Link>
                       {" "}
            {user ? (
              <>
                               {" "}
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                                    Profile                {" "}
                </Link>
                               {" "}
                <Link
                  href="/orders"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                                    Orders                {" "}
                </Link>
                               {" "}
                <Link
                  href="/wishlist"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                                    Wishlist                {" "}
                </Link>
                               {" "}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                                    Sign Out                {" "}
                </button>
                             {" "}
              </>
            ) : (
              <>
                               {" "}
                <Link
                  href="/buyer/auth/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                                    Login                {" "}
                </Link>
                               {" "}
                <Link
                  href="/buyer/auth/register"
                  className="block px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-center"
                >
                                    Sign Up                {" "}
                </Link>
                             {" "}
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
