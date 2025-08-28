import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSellerAnalytics } from '../../hooks/useSeller';

export default function SellerAnalytics() {
  const [user, setUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const {
    analytics,
    isLoading,
    loadAnalytics,
    getRevenueByPeriod,
    getTopProducts,
    exportAnalytics
  } = useSellerAnalytics(user?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/seller/auth/login');
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user?.uid) {
      loadAnalytics(selectedPeriod);
    }
  }, [user?.uid, selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    if (typeof value !== 'number') return '+0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <>
      <Head>
        <title>Analytics - Seller Dashboard</title>
        <meta name="description" content="Analyze your store performance and sales data" />
      </Head>

      <SellerLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header with period selector and export */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
                  <p className="text-gray-600">Comprehensive business intelligence</p>
                </div>
                <div className="flex space-x-3">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last 12 Months</option>
                  </select>
                  <button
                    onClick={() => exportAnalytics('csv')}
                    disabled={isExporting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics?.revenue?.current || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm font-semibold text-green-600">
                      <span className="mr-1">📈</span>
                      {formatPercentage(analytics?.revenue?.growth)}
                    </div>
                    <p className="text-xs text-gray-500">vs last period</p>
                  </div>
                </div>
              </div>
              {/* Similar cards for Orders, Customers, AOV */}
            </div>

            {/* Charts and detailed analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends</h2>
                <div className="h-80 flex items-end justify-between space-x-2">
                  {/* Interactive chart bars */}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h2>
                <div className="space-y-4">
                  {/* Product performance list */}
                </div>
              </div>
            </div>

            {/* Customer segments, traffic sources, performance insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Customer Segments, Traffic Sources, Performance Insights */}
            </div>
          </div>
        </div>
      </SellerLayout>
    </>
  );
}