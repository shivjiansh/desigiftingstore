// pages/seller/payout.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import SellerLayout from "../../components/seller/SellerLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { notify } from "../../lib/notifications";
import {
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "@heroicons/react/24/outline";

export default function SellerPayout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payoutData, setPayoutData] = useState({
    currentWeekEarnings: 0,
    lastWeekPayout: 0,
    totalEarned: 0,
    payoutMethods: [],
    recentPayouts: [],
    dailyBreakdown: [],
    nextPayoutDate: null,
    daysUntilPayout: 0,
  });
  const [showAddMethod, setShowAddMethod] = useState(false);
  const router = useRouter();

  // Get current week dates (Monday to Sunday)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayDate = new Date(today);

    // Adjust to get Monday (0 = Sunday, 1 = Monday, etc.)
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    mondayDate.setDate(today.getDate() - daysFromMonday);

    const weekDates = [];
    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      weekDates.push({
        day: dayNames[i],
        date: date,
        dateString: date.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        isFuture: date > today,
      });
    }

    return weekDates;
  };

  // Calculate next Sunday
  const getNextSunday = () => {
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()));
    nextSunday.setHours(10, 0, 0, 0);
    return nextSunday;
  };

  const getDaysUntilSunday = () => {
    const today = new Date();
    const nextSunday = getNextSunday();
    const diffTime = nextSunday - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/seller/auth/login");
        return;
      }
      if (!user?.role || user.role !== "seller") {
        router.push("/seller/auth/login");
        return;
      }
      fetchPayoutData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);

      const weekDates = getCurrentWeekDates();

      // Mock daily earnings data
      const mockDailyBreakdown = weekDates.map((day, index) => {
        let earnings = 0;
        let orders = 0;
        let views = 0;

        // Generate realistic data based on day
        if (day.isPast || day.isToday) {
          // Past days have actual earnings
          if (day.day === "Monday") {
            earnings = 450.75;
            orders = 3;
            views = 28;
          } else if (day.day === "Tuesday") {
            earnings = 620.5;
            orders = 4;
            views = 35;
          } else if (day.day === "Wednesday") {
            earnings = 380.25;
            orders = 2;
            views = 22;
          } else if (day.day === "Thursday") {
            earnings = 890.0;
            orders = 6;
            views = 42;
          } else if (day.day === "Friday") {
            earnings = 1250.75;
            orders = 8;
            views = 58;
          } else if (day.day === "Saturday" && day.isPast) {
            earnings = 720.5;
            orders = 5;
            views = 38;
          } else if (day.day === "Sunday" && day.isPast) {
            earnings = 560.25;
            orders = 4;
            views = 31;
          } else if (day.isToday) {
            // Today's partial earnings
            const hour = new Date().getHours();
            const progressRatio = hour / 24;
            earnings = Math.round(450 * progressRatio * 100) / 100;
            orders = Math.floor(3 * progressRatio);
            views = Math.floor(30 * progressRatio);
          }
        }

        return {
          ...day,
          earnings,
          orders,
          views,
          netEarnings: earnings * 0.9, // After 10% platform fee
        };
      });

      const totalWeekEarnings = mockDailyBreakdown.reduce(
        (sum, day) => sum + day.netEarnings,
        0
      );

      const mockData = {
        currentWeekEarnings: totalWeekEarnings,
        lastWeekPayout: 2450.75,
        totalEarned: 15670.5,
        nextPayoutDate: getNextSunday(),
        daysUntilPayout: getDaysUntilSunday(),
        dailyBreakdown: mockDailyBreakdown,
        weeklyStats: {
          totalOrders: mockDailyBreakdown.reduce(
            (sum, day) => sum + day.orders,
            0
          ),
          totalViews: mockDailyBreakdown.reduce(
            (sum, day) => sum + day.views,
            0
          ),
          avgOrderValue:
            totalWeekEarnings > 0
              ? (totalWeekEarnings /
                  mockDailyBreakdown.reduce(
                    (sum, day) => sum + day.orders,
                    0
                  )) *
                1.11
              : 0, // Gross AOV
        },
        payoutMethods: [
          {
            id: "1",
            type: "bank",
            accountNumber: "**** **** 1234",
            bankName: "State Bank of India",
            isDefault: true,
          },
          {
            id: "2",
            type: "upi",
            upiId: "seller@paytm",
            isDefault: false,
          },
        ],
        recentPayouts: [
          {
            id: "p1",
            amount: 2450.75,
            status: "completed",
            date: "2025-08-25",
            method: "Bank Transfer",
            transactionId: "WEEKLY_240825_001",
            weekEnding: "Week ending Aug 25, 2025",
            dailyBreakdown: [
              { day: "Mon", earnings: 420.5 },
              { day: "Tue", earnings: 380.25 },
              { day: "Wed", earnings: 510.75 },
              { day: "Thu", earnings: 290.0 },
              { day: "Fri", earnings: 450.25 },
              { day: "Sat", earnings: 250.0 },
              { day: "Sun", earnings: 149.0 },
            ],
          },
          {
            id: "p2",
            amount: 1890.5,
            status: "completed",
            date: "2025-08-18",
            method: "Bank Transfer",
            transactionId: "WEEKLY_240818_001",
            weekEnding: "Week ending Aug 18, 2025",
          },
        ],
      };

      setPayoutData(mockData);
    } catch (error) {
      console.error("Error fetching payout data:", error);
      notify.error("Failed to load payout data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "processing":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (authLoading || loading) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </SellerLayout>
    );
  }

  if (!isAuthenticated || !user || user.role !== "seller") {
    return null;
  }

  return (
    <>
      <Head>
        <title>Payouts - Seller Dashboard</title>
      </Head>

      <SellerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Weekly Payouts
              </h1>
              <p className="text-gray-600 mt-1">
                Automatic payouts every Sunday at 10 AM
              </p>
            </div>
            <Link href="/seller/payout-info" className="btn btn-outline btn-sm">
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              How It Works
            </Link>
          </div>

          {/* Weekly Payout Schedule Banner */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-4">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Next Payout
                  </h3>
                  <p className="text-green-700 font-medium">
                    {payoutData.nextPayoutDate?.toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at 10:00 AM
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">This Week's Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{payoutData.currentWeekEarnings.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-green-200">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {payoutData.daysUntilPayout}
                </div>
                <div className="text-xs text-gray-600">Days until payout</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {payoutData.weeklyStats?.totalOrders || 0}
                </div>
                <div className="text-xs text-gray-600">Orders this week</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  ₹
                  {(
                    payoutData.weeklyStats?.avgOrderValue || 0
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Avg order value</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  ₹{payoutData.lastWeekPayout.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Last payout</div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  This Week's Daily Breakdown
                </h2>
                <span className="text-sm text-gray-500">Monday - Sunday</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {payoutData.dailyBreakdown.map((day, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      day.isToday
                        ? "border-blue-300 bg-blue-50"
                        : day.isPast
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div
                          className={`text-sm font-medium ${
                            day.isToday
                              ? "text-blue-700"
                              : day.isPast
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}
                        >
                          {day.day}
                        </div>
                        {day.isToday && (
                          <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mb-2">
                        {day.dateString}
                      </div>

                      {day.isPast || day.isToday ? (
                        <>
                          <div
                            className={`text-lg font-bold mb-1 ${
                              day.isToday ? "text-blue-700" : "text-green-700"
                            }`}
                          >
                            ₹{day.netEarnings.toLocaleString()}
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Orders:</span>
                              <span className="font-medium">{day.orders}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Views:</span>
                              <span className="font-medium">{day.views}</span>
                            </div>
                            {day.orders > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">AOV:</span>
                                <span className="font-medium">
                                  ₹
                                  {Math.round(
                                    (day.earnings / day.orders) * 1.11
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {day.isToday && (
                            <div className="mt-2 px-2 py-1 bg-blue-100 rounded text-xs text-blue-700 font-medium">
                              Live
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-400">
                          <ClockIcon className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-xs">Pending</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Week Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      ₹{payoutData.currentWeekEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Net Earnings
                    </div>
                    <div className="text-xs text-gray-500">
                      After 10% platform fee
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {payoutData.weeklyStats?.totalOrders || 0}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Total Orders
                    </div>
                    <div className="text-xs text-gray-500">This week</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {payoutData.weeklyStats?.totalViews || 0}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      Total Views
                    </div>
                    <div className="text-xs text-gray-500">Product views</div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">
                      {payoutData.weeklyStats?.totalOrders > 0
                        ? `${(
                            (payoutData.weeklyStats.totalOrders /
                              payoutData.weeklyStats.totalViews) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </div>
                    <div className="text-sm text-yellow-600 font-medium">
                      Conversion
                    </div>
                    <div className="text-xs text-gray-500">Orders / Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How Weekly Payouts Work */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  How Weekly Payouts Work
                </h3>
                <div className="text-blue-800 text-sm space-y-1">
                  <p>
                    • <strong>Monday-Sunday:</strong> Your daily earnings
                    accumulate automatically
                  </p>
                  <p>
                    • <strong>Every Sunday at 10 AM:</strong> Automatic payout
                    to your bank account
                  </p>
                  <p>
                    • <strong>No action needed:</strong> Your earnings are
                    calculated and paid automatically
                  </p>
                  <p>
                    • <strong>Platform fee:</strong> 10% deducted from gross
                    sales (you keep 90%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-medium text-gray-900">
                Secure & Reliable Payouts
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>• ₹10+ Crores paid</div>
              <div>• 99.9% success rate</div>
              <div>• Bank-grade security</div>
              <div>• 24/7 support</div>
            </div>
          </div>

          {/* Payout Methods */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payout Methods
                </h2>
                <button
                  onClick={() => setShowAddMethod(true)}
                  className="btn btn-primary btn-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Method
                </button>
              </div>
            </div>

            <div className="p-6">
              {payoutData.payoutMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payout methods added</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Add your bank account to receive weekly payouts
                  </p>
                  <button
                    onClick={() => setShowAddMethod(true)}
                    className="btn btn-primary"
                  >
                    Add Your Bank Account
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payoutData.payoutMethods.map((method) => (
                    <div
                      key={method.id}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-white rounded-lg">
                            {method.type === "bank" ? (
                              <BanknotesIcon className="w-5 h-5 text-gray-600" />
                            ) : (
                              <CreditCardIcon className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">
                              {method.type === "bank"
                                ? method.bankName
                                : "UPI Payment"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {method.type === "bank"
                                ? method.accountNumber
                                : method.upiId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Weekly payouts are sent automatically to your active payout
                    method
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payouts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Weekly Payouts
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Breakdown
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payoutData.recentPayouts.map((payout) => (
                    <tr key={payout.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{payout.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(payout.status)}
                          <span
                            className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              payout.status
                            )}`}
                          >
                            {payout.status.charAt(0).toUpperCase() +
                              payout.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.weekEnding}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payout.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payout.dailyBreakdown ? (
                          <div className="flex space-x-1">
                            {payout.dailyBreakdown.map((day, index) => (
                              <div
                                key={index}
                                className="text-xs bg-gray-100 rounded px-1 py-0.5"
                                title={`${day.day}: ₹${day.earnings}`}
                              >
                                ₹{Math.round(day.earnings)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {payoutData.recentPayouts.length === 0 && (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payouts yet</p>
                <p className="text-sm text-gray-400">
                  Your first payout will appear here after your first week of
                  sales
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Payment Method Modal */}
        {showAddMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Add Payout Method</h3>
              <p className="text-gray-600 text-sm mb-4">
                Add your bank account details to receive weekly payouts
                automatically.
              </p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMethod(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button className="btn btn-primary">Add Method</button>
              </div>
            </div>
          </div>
        )}
      </SellerLayout>
    </>
  );
}
