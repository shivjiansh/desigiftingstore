// src/pages/seller/dashboard.js
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { useSellerDashboard } from "../../hooks/useSeller";
import Image from "next/image";

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const router = useRouter();

  // Use the seller dashboard hook with user ID
  const {
    profile,
    metrics,
    isLoading: sellerDataLoading,
    loadData,
  } = useSellerDashboard(user?.uid);

  // Handle authentication - STABLE EFFECT
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      console.log("Auth state changed, current user:", currentUser);
      if (!currentUser) {
        router.push("/seller/auth/login");
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    if (!user) return;

    setOrdersLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/orders/recent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log("result kaha hai?",result);
        setRecentOrders(result.data.recentOrders);
      } else {
       console.log("problem while fetching order recent");
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      // Set fallback data on error
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load seller data when user changes - PREVENT INFINITE LOOP
  useEffect(() => {
    if (user?.uid && !authLoading && !sellerDataLoading) {
      console.log("Loading seller data for:", user.uid);
      loadData();
    }
  }, [user?.uid, authLoading]);

  // Load recent orders when user is available
  useEffect(() => {
    if (user) {
      fetchRecentOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    if (!value) return "+0%";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value) => {
    if (!value || value === 0) return "➖";
    return value > 0 ? "📈" : "📉";
  };

  const getGrowthColor = (value) => {
    if (!value || value === 0) return "text-gray-600";
    return value > 0 ? "text-green-600" : "text-red-600";
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Redirecting to login...</div>
      </div>
    );
  }

  // Show loading while seller data loads
  if (sellerDataLoading) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  console.log("Seller profile data:", profile);

  // Get stats with fallback values
  const stats = {
    totalRevenue: profile?.sellerStats?.totalRevenue || 0,
    totalOrders: profile?.sellerStats?.totalOrders || 0,
    totalProducts: profile?.sellerStats?.totalProducts || 0,
    pendingOrders: profile?.sellerStats?.pendingOrders || 0,
    monthlyRevenue: profile?.sellerStats?.monthlyRevenue || 0,
    completedOrders: profile?.sellerStats?.completedOrders || 0,
    averageOrderValue: profile?.sellerStats?.averageOrderValue || 0,
  };

  // Get performance metrics with fallback
  const performanceMetrics = metrics || {
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    productGrowth: 15.2,
    avgOrderGrowth: 5.7,
  };

  return (
    <>
      <Head>
        <title>Seller Dashboard - Desigifting</title>
        <meta
          name="description"
          content="Manage your store and track performance"
        />
      </Head>

      <SellerLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back,{" "}
                    {profile?.businessInfo?.businessName ||
                      profile?.name ||
                      user?.displayName ||
                      user?.email?.split("@")[0]}
                    ! 👋
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {profile?.businessInfo?.description ||
                      "Here's how your store is performing today"}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href="/seller/products/add"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <span>+</span>
                    <span>Add Product</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Grid with Growth Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                    </div>
                  </div>
                  {/* <div className="text-right">
                    <div
                      className={`flex items-center text-sm font-semibold ${getGrowthColor(
                        performanceMetrics.revenueGrowth
                      )}`}
                    >
                      <span className="mr-1">
                        {getGrowthIcon(performanceMetrics.revenueGrowth)}
                      </span>
                      {formatPercentage(performanceMetrics.revenueGrowth)}
                    </div>
                    <p className="text-xs text-gray-500">vs last month</p>
                  </div> */}
                </div>
              </div>
              {/* Total Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalOrders}
                      </p>
                    </div>
                  </div>
                  {/* <div className="text-right">
                    <div
                      className={`flex items-center text-sm font-semibold ${getGrowthColor(
                        performanceMetrics.orderGrowth
                      )}`}
                    >
                      <span className="mr-1">
                        {getGrowthIcon(performanceMetrics.orderGrowth)}
                      </span>
                      {formatPercentage(performanceMetrics.orderGrowth)}
                    </div>
                    <p className="text-xs text-gray-500">vs last month</p>
                  </div> */}
                </div>
              </div>
              {/* Products */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Products
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalProducts}
                      </p>
                    </div>
                  </div>
                  {/* <div className="text-right">
                    <div
                      className={`flex items-center text-sm font-semibold ${getGrowthColor(
                        performanceMetrics.productGrowth
                      )}`}
                    >
                      <span className="mr-1">
                        {getGrowthIcon(performanceMetrics.productGrowth)}
                      </span>
                      {formatPercentage(performanceMetrics.productGrowth)}
                    </div>
                    <p className="text-xs text-gray-500">new this month</p>
                  </div> */}
                </div>
              </div>

              <Link href="/seller/milestones" className="group">
                <div className="relative overflow-hidden">
                  {/* Anniversary Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 opacity-80 rounded-xl"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-300 to-transparent opacity-20 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-300 to-transparent opacity-15 rounded-full -ml-12 -mb-12"></div>

                  {/* Enhanced Milestone Progress Card */}
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-4 sm:p-6 border-2 border-amber-200 group-hover:shadow-lg group-hover:border-amber-300 transition-all duration-200 cursor-pointer">
                    {/* Anniversary Badge - Responsive positioning */}
                    <div className="absolute -top-0 -right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse z-20">
                      LIMITED TIME!
                    </div>

                    {/* Mobile-First Flex Layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Icon Section - Centered on mobile */}
                      <div className="flex justify-center sm:justify-start">
                        <div className="relative p-3 sm:p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg shadow-sm">
                          <span className="text-2xl">🎉</span>
                          {/* Sparkle effect - smaller on mobile */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>

                      {/* Content Section - Full width on mobile */}
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900">
                            Milestone Mega Celebration
                          </h3>
                        </div>

                        {/* Enhanced Progress Bar - Taller on mobile */}
                        <div className="relative w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden mb-2">
                          <div
                            className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 h-full rounded-full transition-all duration-1000 relative"
                            style={{
                              width: `${
                                ((stats.totalOrders % 150) / 150) * 100
                              }%`,
                            }}
                          >
                            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                          </div>
                        </div>

                        {/* Progress Text - Stacked on small mobile */}
                        <div className="flex flex-col xs:flex-row xs:justify-between text-xs text-gray-600 gap-1 xs:gap-0">
                          <span className="font-semibold text-amber-700">
                            {150 - (stats.totalOrders % 150)} orders remaining
                          </span>
                        </div>
                      </div>

                      {/* Arrow - Centered on mobile, right-aligned on desktop */}
                    </div>

                    {/* Anniversary Event Details - Stacked on mobile */}
                    <div className="mt-4 pt-3 border-t border-amber-200/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <span className="text-amber-700 font-semibold text-center sm:text-left">
                          🎁 Anniversary Special: Up to ₹12,500 total bonus
                        </span>
                        <span className="text-red-600 font-bold animate-pulse text-center sm:text-right">
                          📅 Until Nov 2025
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Average Order Value */}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/seller/products/add" className="group">
                <div className="bg-white rounded-xl shadow-sm p-6 border group-hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <span className="text-2xl">➕</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Add New Product
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create customizable products
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/seller/orders" className="group">
                <div className="bg-white rounded-xl shadow-sm p-6 border group-hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Manage Orders
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stats.pendingOrders} pending orders
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/seller/products" className="group">
                <div className="bg-white rounded-xl shadow-sm p-6 border group-hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <span className="text-2xl">👁️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        View Products
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage your catalog
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h2>
                  <Link
                    href="/seller/orders"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all →
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex justify-between p-4 bg-gray-100 rounded-lg">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-24"></div>
                              <div className="h-3 bg-gray-300 rounded w-32"></div>
                              <div className="h-3 bg-gray-300 rounded w-20"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-16"></div>
                              <div className="h-3 bg-gray-300 rounded w-20"></div>
                              <div className="h-3 bg-gray-300 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {console.log("Recent Orders Data:", recentOrders)}
                    {recentOrders.slice(0, 5).map((order, index) => (
                      <div
                        key={order.id || index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/seller/orders`)}
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Customer: {order.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.items} item{order.items > 1 ? "s" : ""} •{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.amount)}
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by adding products to your store
                    </p>
                    <Link
                      href="/seller/products/add"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                    >
                      Add Your First Product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    </>
  );
}
