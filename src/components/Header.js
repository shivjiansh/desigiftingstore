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
  UserIcon,
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
            <span className="text-xl font-bold text-indigo-600">
              DesiGiftings
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/products"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Products
            </Link>
            <Link
              href="/sellers"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Our Partners
            </Link>
            <Link
              href="/orders"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Orders
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Profile
            </Link>
            <Link
              href="/wishlist"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Wishlist
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                  <UserIcon className="w-6 h-6" />
                  <span className="font-medium">
                    {user.displayName || "Account"}
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            <Link
              href="/products"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Products
            </Link>
            <Link
              href="/sellers"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Partners
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Wishlist
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/buyer/auth/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Login
                </Link>
                <Link
                  href="/buyer/auth/register"
                  className="block px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

// components/Header.jsx
// import { useState } from "react";
// import { useRouter } from "next/router";
// import Link from "next/link";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "../lib/firebase";
// import { signOut } from "firebase/auth";
// import { toast } from "react-hot-toast";
// import {
//   Bars3Icon as MenuIcon,
//   XMarkIcon,
//   ShoppingCartIcon,
//   UserIcon,
// } from "@heroicons/react/24/outline";

// export default function Header() {
//   const [user, loading] = useAuthState(auth);

//   const router = useRouter();
 
//   // Directly select cart count from Zustand store

//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   // Initialize auth listener
//   useEffect(() => {
//     const unsubscribe = initialize();
//     return () => {
//       if (typeof unsubscribe === "function") unsubscribe();
//     };
//   }, [initialize]);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         !e.target.closest(".user-menu") &&
//         !e.target.closest(".user-button")
//       ) {
//         setShowUserMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSignOut = async () => {
//     const result = await signOut();
//     if (result.success) {
//       setShowUserMenu(false);
//       router.push("/");
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
//       setSearchQuery("");
//     }
//   };

//   const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);

//   const navigation = [
//     { name: "Products", href: "/products" },
//     { name: "Brands", href: "/sellers" },
//     { name: "About Us", href: "/about" },
//     { name: "Contact", href: "/contact" },
//   ];

//   if (isLoading) {
//     return (
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
//             <div className="animate-pulse bg-gray-300 h-8 w-48 rounded"></div>
//           </div>
//         </div>
//       </header>
//     );
//   }

//   return (
//     <>
//       <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             {/* Mobile menu button */}
//             <button
//               onClick={toggleMobileMenu}
//               className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
//             >
//               {showMobileMenu ? (
//                 <FiX className="h-6 w-6" />
//               ) : (
//                 <FiMenu className="h-6 w-6" />
//               )}
//             </button>

//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-3 group">
//               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-200">
//                 <FiGift className="h-6 w-6 text-white" />
//               </div>
//               <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
//                 GiftCraft
//               </span>
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center space-x-8">
//               {navigation.map((item) => (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`text-sm font-medium transition-colors duration-200 ${
//                     router.pathname === item.href
//                       ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
//                       : "text-gray-700 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-600 pb-1 border-b-2 border-transparent"
//                   }`}
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </nav>

//             {/* Right side actions */}
//             <div className="flex items-center space-x-4">
//               {isAuthenticated ? (
//                 <>
//                   {/* Welcome message - Desktop only */}
//                   <div className="hidden xl:block text-sm text-gray-600">
//                     Welcome,{" "}
//                     <span className="font-medium text-gray-900">
//                       {user?.displayName}
//                     </span>
//                   </div>

//                   {/* Cart */}

//                   {/* Wishlist */}
//                   <Link href="/wishlist" className="hidden sm:block">
//                     <button className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-red-500 transition-all duration-200">
//                       <FiHeart className="h-5 w-5" />
//                     </button>
//                   </Link>

//                   {/* User menu */}
//                   <div className="relative">
//                     <button
//                       onClick={() => setShowUserMenu(!showUserMenu)}
//                       className="user-button flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
//                     >
//                       {user?.photoURL ? (
//                         <img
//                           src={user.photoURL}
//                           alt="Profile"
//                           className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
//                         />
//                       ) : (
//                         <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
//                           <FiUser className="h-4 w-4 text-white" />
//                         </div>
//                       )}
//                       <span className="hidden sm:block font-medium max-w-24 truncate">
//                         {user?.displayName}
//                       </span>
//                       <svg
//                         className={`h-4 w-4 transition-transform duration-200 ${
//                           showUserMenu ? "rotate-180" : ""
//                         }`}
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </button>

//                     {showUserMenu && (
//                       <div className="user-menu absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
//                         <div className="px-4 py-3 border-b border-gray-100">
//                           <p className="text-sm font-medium text-gray-900">
//                             {user?.displayName}
//                           </p>
//                           <p className="text-sm text-gray-500 truncate">
//                             {user?.email}
//                           </p>
//                         </div>
//                         <div className="py-2">
//                           <Link
//                             href="/account"
//                             className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                           >
//                             <FiSettings className="h-4 w-4 mr-3" />
//                             Account Settings
//                           </Link>
//                           <Link
//                             href="/orders"
//                             className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                           >
//                             <FiPackage className="h-4 w-4 mr-3" />
//                             My Orders
//                           </Link>
//                           <Link
//                             href="/wishlist"
//                             className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors sm:hidden"
//                           >
//                             <FiHeart className="h-4 w-4 mr-3" />
//                             Wishlist
//                           </Link>
//                         </div>
//                         <div className="border-t border-gray-100 py-2">
//                           <button
//                             onClick={handleSignOut}
//                             className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                           >
//                             <FiLogOut className="h-4 w-4 mr-3" />
//                             Sign Out
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <Link href="/auth/buyer/login">
//                     <button className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
//                       Sign In
//                     </button>
//                   </Link>
//                   <Link href="/auth/buyer/register">
//                     <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg">
//                       Get Started
//                     </button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Navigation Menu */}
//       {showMobileMenu && (
//         <div className="lg:hidden fixed inset-0 top-16 z-40 bg-white">
//           <div className="px-4 py-6 space-y-4">
//             {navigation.map((item) => (
//               <Link
//                 key={item.name}
//                 href={item.href}
//                 onClick={() => setShowMobileMenu(false)}
//                 className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
//                   router.pathname === item.href
//                     ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
//                     : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
//                 }`}
//               >
//                 {item.name}
//               </Link>
//             ))}

//             {!isAuthenticated && (
//               <div className="pt-4 border-t border-gray-200 space-y-2">
//                 <Link
//                   href="/auth/buyer/login"
//                   onClick={() => setShowMobileMenu(false)}
//                 >
//                   <button className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
//                     Sign In
//                   </button>
//                 </Link>
//                 <Link
//                   href="/auth/buyer/register"
//                   onClick={() => setShowMobileMenu(false)}
//                 >
//                   <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium shadow-md">
//                     Get Started
//                   </button>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Mobile menu overlay */}
//       {showMobileMenu && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30 top-16"
//           onClick={() => setShowMobileMenu(false)}
//         />
//       )}
//     </>
//   );
// }
