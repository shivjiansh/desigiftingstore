import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-hot-toast";


export default function SellerLayout({ children }) {
  const [user, loading] = useAuthState(auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);

  const fetchSellerData = async () => {
    try {
        console.log("Fetching seller data for user:", user);
        // console.log("User Token:", await user.getIdToken());
      const response = await fetch(`/api/seller?uid=${user.uid}`,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch seller data: ${response.statusText}`);
      }
      const data = await response.json();
      setSellerData(data);
      console.log("Fetched seller data:", data);
    } catch (error) {
      console.error("Error fetching seller data:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/seller/dashboard", icon: "🏠" },
    { name: "Products", href: "/seller/products", icon: "📦" },
    { name: "Orders", href: "/seller/orders", icon: "📋" },
    { name: "Analytics", href: "/seller/analytics", icon: "📊" },
    { name: "Profile", href: "/seller/profile", icon: "👨‍💼" },
    { name: "Payout", href: "/seller/payout", icon: "💰" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/seller/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/seller/dashboard" className="flex items-center">
              <span className="text-2xl">🏪</span>
              <span className="ml-2 text-xl font-bold text-emerald-600">
                Seller Hub
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Seller Info */}
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
                      {sellerData.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {sellerData.businessInfo.businessName}
                  </p>
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        sellerData.status === "verified"
                          ? "bg-green-400"
                          : "bg-yellow-400"
                      }`}
                    ></span>
                    <span className="text-xs text-gray-600 capitalize">
                      {sellerData.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <span>⭐ {sellerData.rating}</span>
                <span className="mx-2">•</span>
                <span>{sellerData.totalProducts} products</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive =
                router.pathname === item.href ||
                (item.href !== "/seller/dashboard" &&
                  router.pathname.startsWith(item.href));
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

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                href="/store/${user.uid}"
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
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">☰</span>
            </button>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="text-gray-500 hover:text-gray-700 relative">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Help */}
              <Link
                href="/seller/help"
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-xl">❓</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
