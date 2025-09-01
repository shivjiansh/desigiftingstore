// pages/seller/analytics.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import SellerLayout from "../../components/seller/SellerLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const timeRanges = [
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export default function SellerAnalytics() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("month");
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "seller") {
        router.push("/seller/auth/login");
        return;
      }
      fetchData();
    }
  }, [authLoading, isAuthenticated, user, selectedRange]);

  const fetchData = async () => {
    setLoading(true);
    // Mock data
    const now = new Date();
    if (selectedRange === "month") {
      setData({
        totalSales: 32450.75,
        totalOrders: 180,
        netEarnings: 29205.68,
        avgOrderValue: 162.25,
        chart: Array.from({ length: 4 }, (_, i) => ({
          label: `Wk ${i + 1}`,
          value: Math.floor(Math.random() * 7000) + 3000,
        })),
      });
    } else {
      setData({
        totalSales: 185450.75,
        totalOrders: 1240,
        netEarnings: 166905.68,
        avgOrderValue: 134.62,
        chart: Array.from({ length: 12 }, (_, i) => ({
          label: now.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
            day: undefined,
          }),
          value: Math.floor(Math.random() * 20000) + 10000,
        })),
      });
    }
    setLoading(false);
  };

  const format = (amt) => `₹${amt.toLocaleString()}`;
  if (authLoading || loading) {
    return (
      <SellerLayout>
        <LoadingSpinner size="lg" />
      </SellerLayout>
    );
  }
  if (!data) {
    return (
      <SellerLayout>
        <div className="p-6">No data</div>
      </SellerLayout>
    );
  }
  return (
    <>
      <Head>
        <title>Analytics</title>
      </Head>
      <SellerLayout>
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="border px-3 py-1 rounded"
            >
              {timeRanges.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm text-gray-600">Total Sales</h3>
              <p className="text-2xl font-bold">{format(data.totalSales)}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm text-gray-600">Total Orders</h3>
              <p className="text-2xl font-bold">{data.totalOrders}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm text-gray-600">Net Earnings</h3>
              <p className="text-2xl font-bold">{format(data.netEarnings)}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm text-gray-600">Avg Order Value</h3>
              <p className="text-2xl font-bold">{format(data.avgOrderValue)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRange === "month" ? "Weekly" : "Monthly"} Trend
            </h3>
            <div className="flex items-end space-x-2 h-40">
              {data.chart.map((pt, i) => {
                const max = Math.max(...data.chart.map((p) => p.value));
                const h = max ? (pt.value / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${h}%` }}
                      title={`${pt.label}: ${format(pt.value)}`}
                    />
                    <span className="text-xs mt-2">{pt.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/seller/products"
              className="p-3 border rounded text-center hover:bg-gray-50"
            >
              Add Product
            </Link>
            <Link
              href="/seller/orders"
              className="p-3 border rounded text-center hover:bg-gray-50"
            >
              View Orders
            </Link>
            <Link
              href="/seller/payout"
              className="p-3 border rounded text-center hover:bg-gray-50"
            >
              Payouts
            </Link>
            <Link
              href="/seller/profile"
              className="p-3 border rounded text-center hover:bg-gray-50"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </SellerLayout>
    </>
  );
}
