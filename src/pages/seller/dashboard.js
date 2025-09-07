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
        console.log(result);
        setRecentOrders(result.data);
      } else {
        console.error("Failed to fetch recent orders:", result.error);
        // Set fallback data if API fails
        setRecentOrders([
          {
            id: "ORD-1234",
            customerName: "John Doe",
            amount: 299.99,
            status: "pending",
            createdAt: new Date(),
            items: 1,
          },
          {
            id: "ORD-1233",
            customerName: "Jane Smith",
            amount: 156.5,
            status: "completed",
            createdAt: new Date(),
            items: 2,
          },
          {
            id: "ORD-1232",
            customerName: "Mike Johnson",
            amount: 89.99,
            status: "processing",
            createdAt: new Date(),
            items: 1,
          },
        ]);
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
    totalRevenue: profile?.sellerStats?.totalRevenue || 1,
    totalOrders: profile?.sellerStats?.totalOrders || 1,
    totalProducts: profile?.sellerStats?.totalProducts || 1,
    pendingOrders: profile?.sellerStats?.pendingOrders || 1,
    monthlyRevenue: profile?.sellerStats?.monthlyRevenue || 1,
    completedOrders: profile?.sellerStats?.completedOrders || 1,
    averageOrderValue: profile?.sellerStats?.averageOrderValue || 1,
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
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
                  <div className="text-right">
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
                  </div>
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
                  <div className="text-right">
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
                  </div>
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
                  <div className="text-right">
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
                  </div>
                </div>
              </div>
              
              <Link href="/seller/milestones" className="group">
                <div className="bg-white rounded-xl shadow-sm p-6 border group-hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Milestone Progress
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stats.totalOrders % 150}/150 orders to bonus
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              ((stats.totalOrders % 150) / 150) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Average Order Value */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <span className="text-2xl">💎</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`flex items-center text-sm font-semibold ${getGrowthColor(
                        performanceMetrics.avgOrderGrowth
                      )}`}
                    >
                      <span className="mr-1">
                        {getGrowthIcon(performanceMetrics.avgOrderGrowth)}
                      </span>
                      {formatPercentage(performanceMetrics.avgOrderGrowth)}
                    </div>
                    <p className="text-xs text-gray-500">vs last month</p>
                  </div>
                </div>
              </div>
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
                    {recentOrders.slice(0, 3).map((order, index) => (
                      <div
                        key={order.id || index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/seller/orders`)}
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            #{order.id.slice(8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Customer: {order.buyerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.items} item{order.items > 1 ? "s" : ""} •{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
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
