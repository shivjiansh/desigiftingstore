import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-hot-toast";
import { useSellerStore } from "../../stores/sellerStore";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function SellerLayout({ children }) {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSellerData, setLocalSellerData] = useState(null);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false); // Prevent duplicate calls
  const router = useRouter();

  const {
    profile,
    loadProfile,
    getDashboardStats,
    isLoading: storeLoading,
  } = useSellerStore();

  // Only fetch once per user session
  useEffect(() => {
    if (user?.uid && !hasLoadedProfile && !profile) {
      fetchSellerData();
    }
  }, [user?.uid, hasLoadedProfile, profile]);

  const fetchSellerData = async () => {
    if (loading || hasLoadedProfile) return;

    try {
      setLoading(true);
      setError(null);

      const [apiResponse] = await Promise.all([
        fetch(`/api/seller?uid=${user.uid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }),
        // Only load profile if not already loaded
        !profile ? loadProfile(user.uid) : Promise.resolve(),
      ]);

      if (!apiResponse.ok) {
        throw new Error(
          `HTTP ${apiResponse.status}: ${apiResponse.statusText}`
        );
      }

      const data = await apiResponse.json();
      setLocalSellerData(data);
      setHasLoadedProfile(true);
    } catch (err) {
      console.error("Error fetching seller data:", err);
      setError(err.message);
      toast.error("Failed to fetch seller data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLocalSellerData(null);
      setHasLoadedProfile(false); // Reset on signout
      toast.success("Signed out successfully");
      router.push("/products");
    } catch {
      toast.error("Error signing out");
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/seller/dashboard", icon: "🏠" },
    { name: "Products", href: "/seller/products", icon: "📦" },
    { name: "Orders", href: "/seller/orders", icon: "📋" },
    { name: "Analytics", href: "/seller/analytics", icon: "📊" },
    { name: "Profile", href: "/seller/profile", icon: "👨‍💼" },
    { name: "Bonus", href: "/seller/milestones", icon: "🎉" },
    { name: "Payout", href: "/seller/payout", icon: "💰" },
  ];

  const sellerData = profile || localSellerData;

  if (loading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="mb-4 text-red-600 font-bold">Error: {error}</p>
        <button
          onClick={() => {
            setHasLoadedProfile(false);
            fetchSellerData();
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    // router.push("/auth/seller/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/seller/dashboard" className="flex items-center">
              <span className="text-2xl">🏪</span>
              <span className="ml-2 text-xl font-bold text-emerald-600">
                Seller Studio
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {sellerData && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  {sellerData.profileImage ? (
                    <img
                      src={sellerData.profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-emerald-600 font-medium">
                      {sellerData.businessName?.charAt(0) ||
                        sellerData.businessInfo?.businessName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {sellerData.businessInfo?.businessName ||
                      sellerData.name ||
                      "Business Name"}
                  </p>
                  <div className="flex items-center">
                    <span className="inline-flex items-center mr-2">
                      {sellerData.status === "verified" ||
                      sellerData.isVerified ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <ClockIcon className="w-4 h-4 text-yellow-400" />
                      )}
                    </span>
                    <span className="text-xs text-gray-600 capitalize">
                      {sellerData.status ||
                        (sellerData.isVerified ? "verified" : "pending")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-gray-600">
                ⭐ {sellerData.rating || sellerData.sellerStats?.rating || 0}
                <span className="mx-2">•</span>
                {sellerData.totalProducts ||
                  sellerData.sellerStats?.totalProducts ||
                  0}{" "}
                products
              </div>
            </div>
          )}

          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== "/seller/dashboard" &&
                  router.pathname.startsWith(item.href));
                   if (item.name === "Bonus") {
                     return (
                       <div key={item.name} className="relative">
                         {/* Anniversary Background */}
                         <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-yellow-100 opacity-60 rounded-md animate-pulse"></div>

                         <Link
                           href={item.href}
                           className={`relative flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group ${
                             isActive
                               ? "bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800 shadow-md"
                               : "text-amber-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100"
                           }`}
                         >
                           <div className="flex items-center">
                             <span className="mr-3 text-lg animate-bounce">
                               {item.icon}
                             </span>
                             <span className="font-semibold">{item.name}</span>
                           </div>

                           {/* Anniversary Badge */}
                           <div className="flex flex-col items-end">
                             
                             <span className="text-xs text-amber-600 font-medium mt-0.5">
                               Limited
                             </span>
                           </div>
                         </Link>

                         {/* Sparkle Effects */}
                         <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                         <div
                           className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-60"
                           style={{ animationDelay: "1s" }}
                         ></div>
                       </div>
                     );
                   }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              href={`/store/${user.uid}`}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50"
            >
              <span className="mr-3 text-lg">🛍️</span>
              View Store
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50"
            >
              <span className="mr-3 text-lg">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ☰
            </button>
            <div className="flex items-center gap-2 my-4">
              <div className="w-10 h-10 relative overflow-hidden rounded-lg">
                <Image
                  src="/images/logo1.png"
                  alt="DesiGifting Logo"
                  width={100}
                  height={100}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight leading-none">
                  DesiGifting
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
