// // pages/seller/analytics.js
// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// import Link from "next/link";
// import { useAuth } from "../../hooks/useAuth";
// import SellerLayout from "../../components/seller/SellerLayout";
// import LoadingSpinner from "../../components/common/LoadingSpinner";

// const timeRanges = [
//   { label: "This Month", value: "month" },
//   { label: "This Year", value: "year" },
// ];

// export default function SellerAnalytics() {
//   const { user, isAuthenticated, isLoading: authLoading } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [selectedRange, setSelectedRange] = useState("month");
//   const [data, setData] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     if (!authLoading) {
//       if (!isAuthenticated || user?.role !== "seller") {
//         router.push("/seller/auth/login");
//         return;
//       }
//       fetchData();
//     }
//   }, [authLoading, isAuthenticated, user, selectedRange]);

//   const fetchData = async () => {
//     setLoading(true);
//     // Mock data
//     const now = new Date();
//     if (selectedRange === "month") {
//       setData({
//         totalSales: 32450.75,
//         totalOrders: 180,
//         netEarnings: 29205.68,
//         avgOrderValue: 162.25,
//         chart: Array.from({ length: 4 }, (_, i) => ({
//           label: `Wk ${i + 1}`,
//           value: Math.floor(Math.random() * 7000) + 3000,
//         })),
//       });
//     } else {
//       setData({
//         totalSales: 185450.75,
//         totalOrders: 1240,
//         netEarnings: 166905.68,
//         avgOrderValue: 134.62,
//         chart: Array.from({ length: 12 }, (_, i) => ({
//           label: now.toLocaleDateString("en-US", {
//             month: "short",
//             year: "2-digit",
//             day: undefined,
//           }),
//           value: Math.floor(Math.random() * 20000) + 10000,
//         })),
//       });
//     }
//     setLoading(false);
//   };

//   const format = (amt) => `₹${amt.toLocaleString()}`;
//   if (authLoading || loading) {
//     return (
//       <SellerLayout>
//         <LoadingSpinner size="lg" />
//       </SellerLayout>
//     );
//   }
//   if (!data) {
//     return (
//       <SellerLayout>
//         <div className="p-6">No data</div>
//       </SellerLayout>
//     );
//   }
//   return (
//     <>
//       <Head>
//         <title>Analytics</title>
//       </Head>
//       <SellerLayout>
//         <div className="space-y-6 p-6">
//           <div className="flex justify-between items-center">
//             <h1 className="text-2xl font-bold">Analytics</h1>
//             <select
//               value={selectedRange}
//               onChange={(e) => setSelectedRange(e.target.value)}
//               className="border px-3 py-1 rounded"
//             >
//               {timeRanges.map((r) => (
//                 <option key={r.value} value={r.value}>
//                   {r.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <div className="bg-white p-4 rounded shadow">
//               <h3 className="text-sm text-gray-600">Total Sales</h3>
//               <p className="text-2xl font-bold">{format(data.totalSales)}</p>
//             </div>
//             <div className="bg-white p-4 rounded shadow">
//               <h3 className="text-sm text-gray-600">Total Orders</h3>
//               <p className="text-2xl font-bold">{data.totalOrders}</p>
//             </div>
//             <div className="bg-white p-4 rounded shadow">
//               <h3 className="text-sm text-gray-600">Net Earnings</h3>
//               <p className="text-2xl font-bold">{format(data.netEarnings)}</p>
//             </div>
//             <div className="bg-white p-4 rounded shadow">
//               <h3 className="text-sm text-gray-600">Avg Order Value</h3>
//               <p className="text-2xl font-bold">{format(data.avgOrderValue)}</p>
//             </div>
//           </div>

//           {/* Chart */}
//           <div className="bg-white p-4 rounded shadow">
//             <h3 className="text-lg font-semibold mb-4">
//               {selectedRange === "month" ? "Weekly" : "Monthly"} Trend
//             </h3>
//             <div className="flex items-end space-x-2 h-40">
//               {data.chart.map((pt, i) => {
//                 const max = Math.max(...data.chart.map((p) => p.value));
//                 const h = max ? (pt.value / max) * 100 : 0;
//                 return (
//                   <div key={i} className="flex-1 flex flex-col items-center">
//                     <div
//                       className="w-full bg-blue-500 rounded-t"
//                       style={{ height: `${h}%` }}
//                       title={`${pt.label}: ${format(pt.value)}`}
//                     />
//                     <span className="text-xs mt-2">{pt.label}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <Link
//               href="/seller/products"
//               className="p-3 border rounded text-center hover:bg-gray-50"
//             >
//               Add Product
//             </Link>
//             <Link
//               href="/seller/orders"
//               className="p-3 border rounded text-center hover:bg-gray-50"
//             >
//               View Orders
//             </Link>
//             <Link
//               href="/seller/payout"
//               className="p-3 border rounded text-center hover:bg-gray-50"
//             >
//               Payouts
//             </Link>
//             <Link
//               href="/seller/profile"
//               className="p-3 border rounded text-center hover:bg-gray-50"
//             >
//               Edit Profile
//             </Link>
//           </div>
//         </div>
//       </SellerLayout>
//     </>
//   );
// }
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { useSellerDashboard } from "../../hooks/useSeller";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function SellerAnalytics() {
  const [user] = useAuthState(auth);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const {
    profile,
    metrics,
    isLoading: sellerDataLoading,
    loadData,
  } = useSellerDashboard(user?.uid);

  useEffect(() => {
    if (user?.uid && !sellerDataLoading) {
      loadData();
    }
  }, [user?.uid]);

  // Mock analytics data
  const stats = {
    totalRevenue: profile?.sellerStats?.totalRevenue || 25340,
    totalOrders: profile?.sellerStats?.totalOrders || 47,
    totalProducts: profile?.sellerStats?.totalProducts || 12,
    averageOrderValue: profile?.sellerStats?.averageOrderValue || 539,
    conversionRate: 3.2,
    returningCustomers: 68,
    topProducts: [
      { name: "Custom Photo Frame", sales: 15, revenue: 4500 },
      { name: "Personalized Mug", sales: 12, revenue: 3600 },
      { name: "Custom T-Shirt", sales: 8, revenue: 2400 },
      { name: "Engraved Keychain", sales: 6, revenue: 1200 },
    ],
    recentActivity: [
      {
        type: "sale",
        product: "Custom Photo Frame",
        amount: 299,
        time: "2 hours ago",
      },
      {
        type: "view",
        product: "Personalized Mug",
        views: 24,
        time: "3 hours ago",
      },
      {
        type: "review",
        product: "Custom T-Shirt",
        rating: 5,
        time: "5 hours ago",
      },
    ],
    salesData: [120, 190, 300, 500, 200, 300, 450], // Last 7 days
  };

  const periods = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 3 Months" },
    { value: "1y", label: "Last Year" },
  ];

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "products", name: "Products", icon: "📦" },
    { id: "customers", name: "Customers", icon: "👥" },
    { id: "reports", name: "Reports", icon: "📈" },
  ];

  if (sellerDataLoading) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics & Insights - DesiGifting Seller</title>
        <meta
          name="description"
          content="Track your store performance and analytics"
        />
      </Head>

      <SellerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Analytics & Insights
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Track your store performance and make data-driven decisions
              </p>
            </div>

            {/* Time Period Selector */}
            <div className="flex gap-2">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    selectedPeriod === period.value
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6 sm:mb-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-xl sm:text-2xl">💰</span>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Revenue
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        ₹{stats.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        +12.5%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-xl sm:text-2xl">🛍️</span>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Orders
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {stats.totalOrders}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">+8.3%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-xl sm:text-2xl">💎</span>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        AOV
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        ₹{stats.averageOrderValue}
                      </p>
                      <p className="text-xs text-purple-600 font-medium">
                        +5.7%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <span className="text-xl sm:text-2xl">📈</span>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Conversion
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {stats.conversionRate}%
                      </p>
                      <p className="text-xs text-orange-600 font-medium">
                        +0.8%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sales Trend
                    </h3>
                    <button
                      onClick={() => setShowComingSoon(true)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                  <div className="h-48 sm:h-64 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl mb-2">📊</div>
                      <p className="text-gray-600 text-sm">Interactive Chart</p>
                      <button
                        onClick={() => setShowComingSoon(true)}
                        className="text-emerald-600 hover:underline text-xs mt-1"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top Products
                  </h3>
                  <div className="space-y-3">
                    {stats.topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-emerald-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {product.sales} sales
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{product.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === "sale"
                            ? "bg-green-100"
                            : activity.type === "view"
                            ? "bg-blue-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <span>
                          {activity.type === "sale"
                            ? "💰"
                            : activity.type === "view"
                            ? "👁️"
                            : "⭐"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === "sale" &&
                            `Sale: ${activity.product}`}
                          {activity.type === "view" &&
                            `${activity.views} views on ${activity.product}`}
                          {activity.type === "review" &&
                            `${activity.rating}-star review on ${activity.product}`}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      {activity.amount && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            +₹{activity.amount}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Product Analytics
                </h3>
                <p className="text-gray-600 mb-4">
                  Detailed product performance metrics coming soon
                </p>
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Get Notified
                </button>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Customer Insights
                </h3>
                <p className="text-gray-600 mb-4">
                  Advanced customer analytics and segmentation coming soon
                </p>
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Get Notified
                </button>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Advanced Reports
                </h3>
                <p className="text-gray-600 mb-4">
                  Export detailed reports and custom analytics coming soon
                </p>
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Get Notified
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Coming Soon Modal */}
        {showComingSoon && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl max-w-sm w-full p-8 shadow-xl mx-4">
              <button
                onClick={() => router.back()}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Advanced Analytics Coming Soon!
              </h3>
              <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
                We're building powerful analytics tools with interactive charts,
                detailed reports, and customer insights. Stay tuned!
              </p>
              <button
                onClick={() =>
                  (window.location.href =
                    "mailto:shivansh.jauhari@gmail.com?subject=Analytics Feature Request")
                }
                className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Request Early Access
              </button>
            </div>
          </div>
        )}
      </SellerLayout>
    </>
  );
}
