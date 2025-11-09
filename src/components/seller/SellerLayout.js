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
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const router = useRouter();

  const {
    profile,
    loadProfile,
    getDashboardStats,
    isLoading: storeLoading,
  } = useSellerStore();

  // Persist user's preference for sidebar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sellerSidebarOpen");
      if (saved !== null) setSidebarOpen(saved === "1");
    } catch (e) {
      console.log("Could not read sidebar preference");
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      sessionStorage.setItem("isSeller", "1");
      sessionStorage.setItem("lastWasSeller", "1");
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem("sellerSidebarOpen", sidebarOpen ? "1" : "0");
      localStorage.setItem("isSeller","1");
    } catch (e) {
      console.log("Could not save sidebar preference");
    }
  }, [sidebarOpen]);

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

      const idToken = user ? await user.getIdToken() : "";

      const [apiResponse] = await Promise.all([
        fetch(`/api/seller?uid=${user?.uid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }),
        !profile ? loadProfile(user?.uid) : Promise.resolve(),
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
      setError(err?.message || "Failed to fetch seller data");
      toast.error("Failed to fetch seller data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLocalSellerData(null);
      setHasLoadedProfile(false);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Backdrop for all breakpoints when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapsible sidebar (same behavior on all screen sizes) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
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
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
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

                      <div className="flex flex-col items-end">
                        <span className="text-xs text-amber-600 font-medium mt-0.5">
                          Limited
                        </span>
                      </div>
                    </Link>

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

      {/* Right column: shift only when sidebar is open */}
      <div
        className={`${
          sidebarOpen ? "pl-64" : ""
        } flex flex-col min-h-screen transition-[padding] duration-300`}
      >
        {/* Header with universal toggle */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium"
                aria-label="Toggle sidebar"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="hidden sm:inline text-2xl">Seller Studio</span>
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
          </div>
        </header>

        {/* Main content area (centered & constrained) */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
