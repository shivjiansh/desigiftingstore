// pages/seller/payout.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import SellerLayout from "../../components/seller/SellerLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { notify } from "../../lib/notifications";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CalendarIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";

export default function SellerPayout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [addMethodType, setAddMethodType] = useState("bank");
  const [addMethodLoading, setAddMethodLoading] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState(null);
  const [settingActiveId, setSettingActiveId] = useState(null);
  const [addFormFields, setAddFormFields] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountHolderName: "",
    upiId: "",
  });
  const [payoutData, setPayoutData] = useState({
    currentWeekEarnings: 0,
    lastWeekPayout: 0,
    lastPayoutDate: null,
    totalEarned: 0,
    payoutMethods: [],
    recentPayouts: [],
    dailyBreakdown: [],
    nextPayoutDate: null,
    daysUntilPayout: 0,
    weeklyStats: { totalOrders: 0 },
    totalSales: 0,
    cod: 0,
    totalOrders: 0,
    online: 0,
  });
  const router = useRouter();

  // Get current week dates (Sunday to Saturday)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const sundayDate = new Date(today);
    sundayDate.setDate(today.getDate() - currentDay);

    const weekDates = [];
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sundayDate);
      date.setDate(sundayDate.getDate() + i);
      weekDates.push({
        dayIndex: i,
        dayName: dayNames[i],
        date,
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

  const getNextFriday = () => {
    const today = new Date();
    const nextFriday = new Date(today);
    const dayOfWeek = today.getDay();
    let diff = (5 - dayOfWeek + 7) % 7;
    if (diff === 0 && today.getHours() >= 18) diff = 7;
    nextFriday.setDate(today.getDate() + diff);
    nextFriday.setHours(18, 0, 0, 0);
    return nextFriday;
  };

  const getDaysUntilFriday = () => {
    const today = new Date();
    const nextFriday = getNextFriday();
    const diffTime = nextFriday - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user?.role || user.role !== "seller") {
        router.push("/seller/auth/login");
        return;
      }
      if (user?.uid) {
        fetchPayoutData(user.uid);
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchPayoutData = async (sellerId) => {
    try {
      setLoading(true);
      const paymentDocRef = doc(db, "payments", sellerId);
      const paymentDocSnap = await getDoc(paymentDocRef);

      if (!paymentDocSnap.exists()) {
        throw new Error("Payment data not found for seller: " + sellerId);
      }

      const paymentData = paymentDocSnap.data();
      const dailyStats = paymentData.dailyStats || [];
      const totalSales = paymentData.totalSales || 0;
      const cod = paymentData.cod || 0;

      const weekDates = getCurrentWeekDates();

      const payoutDailyBreakdown = weekDates.map((day) => {
        const dayStat = dailyStats.find((ds) => ds.day === day.dayIndex) || {
          orders: [],
          sales: 0,
        };
        const earnings = dayStat.sales || 0;
        const orders = dayStat.orders.length || 0;

        return {
          ...day,
          earnings,
          orders,
          netEarnings: earnings * 0.95,
        };
      });

      setPayoutData({
        sellerId,
        currentWeekEarnings: totalSales * 0.95,
        lastWeekPayout: 0,
        lastPayoutDate: null,
        totalEarned: totalSales,
        nextPayoutDate: getNextFriday(),
        daysUntilPayout: getDaysUntilFriday(),
        dailyBreakdown: payoutDailyBreakdown,
        payoutMethods: paymentData.payoutMethods || [],
        recentPayouts: paymentData.paymentHistory || [],
        codAmount: cod,
        totalSales,
        cod,
        totalOrders: payoutDailyBreakdown.reduce((sum, d) => sum + d.orders, 0),
        online: totalSales - cod,
        weeklyStats: {
          totalOrders: payoutDailyBreakdown.reduce(
            (sum, d) => sum + d.orders,
            0
          ),
        },
      });
    } catch (error) {
      console.error("Error fetching payout data:", error);
      notify.error("Failed to load payout data",{ duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // Submit Add Payment Method
  const submitAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (
      addMethodType === "bank" &&
      (!addFormFields.bankName ||
        !addFormFields.accountNumber ||
        !addFormFields.ifsc ||
        !addFormFields.accountHolderName)
    ) {
      notify.error("Please fill all bank details.");
      return;
    }
    if (addMethodType === "upi" && !addFormFields.upiId) {
      notify.error("Please enter UPI ID.");
      return;
    }

    setAddMethodLoading(true);

    const newMethod = {
      id: Date.now().toString(),
      type: addMethodType,
      isDefault: payoutData.payoutMethods.length === 0,
      createdAt: new Date().toISOString(),
      ...(addMethodType === "bank"
        ? {
            bankName: addFormFields.bankName,
            accountNumber: addFormFields.accountNumber,
            ifsc: addFormFields.ifsc.toUpperCase(),
            accountHolderName: addFormFields.accountHolderName,
          }
        : {
            upiId: addFormFields.upiId,
          }),
    };

    try {
      const paymentDocRef = doc(db, "payments", user.uid);
      await updateDoc(paymentDocRef, {
        payoutMethods: arrayUnion(newMethod),
      });

      notify.success("Payout method added successfully!");
      setShowAddMethod(false);
      setAddFormFields({
        bankName: "",
        accountNumber: "",
        ifsc: "",
        accountHolderName: "",
        upiId: "",
      });
      fetchPayoutData(user.uid);
    } catch (err) {
      console.error(err);
      notify.error("Could not add payout method. Please try again.");
    } finally {
      setAddMethodLoading(false);
    }
  };

  // Set Active Payment Method
  const setActivePaymentMethod = async (methodId) => {
    if (!user?.uid) return;
    setSettingActiveId(methodId);

    try {
      const paymentDocRef = doc(db, "payments", user.uid);
      const updatedMethods = payoutData.payoutMethods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }));

      await updateDoc(paymentDocRef, {
        payoutMethods: updatedMethods,
      });

      notify.success("Active payout method updated!");
      fetchPayoutData(user.uid);
    } catch (err) {
      console.error(err);
      notify.error("Could not set active method. Please try again.");
    } finally {
      setSettingActiveId(null);
    }
  };

  // Delete Payment Method
  const deletePaymentMethod = async (methodId) => {
    if (!user?.uid) return;

    const methodToDelete = payoutData.payoutMethods.find(
      (m) => m.id === methodId
    );
    if (methodToDelete?.isDefault && payoutData.payoutMethods.length > 1) {
      notify.error(
        "Cannot delete active method. Please set another method as active first."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this payout method? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingMethodId(methodId);

    try {
      const paymentDocRef = doc(db, "payments", user.uid);
      const updatedMethods = payoutData.payoutMethods.filter(
        (method) => method.id !== methodId
      );

      await updateDoc(paymentDocRef, {
        payoutMethods: updatedMethods,
      });

      notify.success("Payout method deleted successfully!");
      fetchPayoutData(user.uid);
    } catch (err) {
      console.error(err);
      notify.error("Could not delete payout method. Please try again.");
    } finally {
      setDeletingMethodId(null);
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

  if (!isAuthenticated || !user || user.role !== "seller") return null;

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
                Automatic payouts every Friday at 11:50 PM
              </p>
            </div>
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
                    at 11:50 PM
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  This Week&apos;s Earnings
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{payoutData.currentWeekEarnings.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-green-200">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  ₹{payoutData.totalSales.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Gross Sales</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {payoutData.weeklyStats?.totalOrders || 0}
                </div>
                <div className="text-xs text-gray-600">Orders this week</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  ₹{payoutData.online.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Digital Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  ₹{payoutData.cod.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">COD Transactions</div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  This Week&apos;s Daily Breakdown
                </h2>
                <span className="text-sm text-gray-500">Sunday - Saturday</span>
              </div>
            </div>

            {!payoutData?.dailyBreakdown ||
            payoutData.dailyBreakdown.length === 0 ? (
              <div className="p-4 sm:p-6">
                <div className="text-center py-6 text-gray-600 text-sm italic">
                  <ul class="list-disc list-inside">
                    <li>
                      Promote your store regularly to increase visibility.
                    </li>
                    <li>
                      Run timely offers to attract buyers and boost sales.
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {payoutData.dailyBreakdown.map((day, index) => {
                    const grossSales = day.earnings;
                    const platformFee = grossSales * 0.05;
                    const netEarnings = day.netEarnings;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          day.isToday
                            ? "border-blue-300 bg-blue-50"
                            : day.isPast
                            ? "border-green-200 bg-white"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span
                              className={`text-base font-semibold ${
                                day.isToday
                                  ? "text-blue-700"
                                  : day.isPast
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {day.dayName}
                            </span>
                            {day.isToday && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                            <span className="ml-2 text-sm text-gray-500">
                              {day.dateString}
                            </span>
                          </div>

                          <div>
                            {day.isToday ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5 animate-pulse"></span>
                                Live
                              </span>
                            ) : day.isPast ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            ) : (
                              <ClockIcon className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </div>

                        {day.isPast || day.isToday ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <div className="text-base font-semibold text-gray-900">
                                {day.orders}
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                Orders
                              </div>
                            </div>
                            <div>
                              <div className="text-base font-semibold text-gray-900">
                                ₹{grossSales.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                Sales
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-4 text-gray-400">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm">Pending</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 sm:p-6">
              <div className="space-y-3"></div>
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
                  className="btn btn-primary btn-sm flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
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
                      className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="p-2 bg-white rounded-lg">
                            {method.type === "bank" ? (
                              <BanknotesIcon className="w-5 h-5 text-gray-600" />
                            ) : (
                              <CreditCardIcon className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-900">
                              {method.type === "bank"
                                ? method.bankName
                                : "UPI Payment"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {method.type === "bank"
                                ? `****${method.accountNumber?.slice(-4)}`
                                : method.upiId}
                            </p>
                            {method.type === "bank" && (
                              <p className="text-xs text-gray-500">
                                IFSC: {method.ifsc}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {method.isDefault ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Active
                            </span>
                          ) : (
                            <button
                              onClick={() => setActivePaymentMethod(method.id)}
                              disabled={settingActiveId === method.id}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-full transition disabled:opacity-50"
                            >
                              {settingActiveId === method.id ? (
                                <LoadingSpinner size="xs" />
                              ) : (
                                "Set Active"
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => deletePaymentMethod(method.id)}
                            disabled={deletingMethodId === method.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete payment method"
                          >
                            {deletingMethodId === method.id ? (
                              <LoadingSpinner size="xs" />
                            ) : (
                              <TrashIcon className="w-5 h-5" />
                            )}
                          </button>
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

          {/* Recent Payouts - Payout History */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Payout History
              </h2>
            </div>

            {payoutData.recentPayouts.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payouts yet</p>
                <p className="text-sm text-gray-400">
                  Your payout history will appear here after your first week of
                  sales
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {payoutData.recentPayouts.map((payout, i) => (
                  <Disclosure
                    key={payout.id || i}
                    as="li"
                    defaultOpen={i === 0}
                  >
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {new Date(
                                payout.date || payout.createdAt
                              ).toLocaleDateString("en-IN")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payout.weekEnding || payout.periodEnd}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-semibold text-lg">
                              ₹
                              {(
                                payout.amount ||
                                payout.earnings ||
                                0
                              ).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(payout.status)}
                              <span
                                className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                                  payout.status
                                )}`}
                              >
                                {(payout.status || "pending")
                                  .charAt(0)
                                  .toUpperCase() +
                                  (payout.status || "pending").slice(1)}
                              </span>
                            </span>
                            <ChevronDownIcon
                              className={`w-5 h-5 transition-transform duration-200 ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </Disclosure.Button>

                        <Disclosure.Panel className="bg-gray-50 px-6 py-4 text-sm text-gray-700 space-y-2">
                          <div>
                            <strong>Transaction ID:</strong>{" "}
                            {payout.transactionId || "N/A"}
                          </div>
                          <div>
                            <strong>Payout Method:</strong>{" "}
                            {payout.method || "Bank Transfer"}
                          </div>
                          <div>
                            <strong>COD Transactions:</strong> ₹
                            {payout.codAmount || 0}
                          </div>
                          <div>
                            <strong>Digital Transactions:</strong> ₹
                            {payout.totalSales - payout.codAmount || 0}
                          </div>
                          <div>
                            <strong>Total Sales:</strong> ₹
                            {(payout.totalSales || 0).toLocaleString()}
                          </div>
                          <div>
                            <strong>Platform Fee (5%):</strong> ₹
                            {(payout.platformFee || 0).toLocaleString()}
                          </div>
                          <div>
                            <strong>Your Earnings:</strong> ₹
                            {(
                              payout.earnings ||
                              payout.amount ||
                              0
                            ).toLocaleString()}
                          </div>
                          <div>
                            <strong>Your Payout:</strong> ₹
                            {(
                              payout.earnings - payout.codAmount || 0
                            ).toLocaleString()}
                          </div>
                          {payout.remarks && (
                            <div>
                              <strong>Remarks:</strong> {payout.remarks}
                            </div>
                          )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </ul>
            )}
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
                    • <strong>Saturday-Friday:</strong> Your daily earnings
                    accumulate automatically
                  </p>
                  <p>
                    • <strong>Every Friday at 11:50 PM:</strong> Automatic
                    payout to your active bank account
                  </p>
                  <p>
                    • <strong>No action needed:</strong> Your earnings are
                    calculated and paid automatically
                  </p>
                  <p>
                    • <strong>Platform fee:</strong> 5% deducted from gross
                    sales (you keep 95%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Payment Method Modal */}
        {showAddMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                onClick={() => {
                  setShowAddMethod(false);
                  setAddFormFields({
                    bankName: "",
                    accountNumber: "",
                    ifsc: "",
                    accountHolderName: "",
                    upiId: "",
                  });
                }}
                aria-label="Close"
                disabled={addMethodLoading}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <h3 className="text-lg font-semibold mb-4">Add Payout Method</h3>

              <form onSubmit={submitAddPaymentMethod} className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      addMethodType === "bank"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setAddMethodType("bank")}
                    disabled={addMethodLoading}
                  >
                    Bank Account
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      addMethodType === "upi"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setAddMethodType("upi")}
                    disabled={addMethodLoading}
                  >
                    UPI
                  </button>
                </div>

                {addMethodType === "bank" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={addFormFields.accountHolderName}
                        onChange={(e) =>
                          setAddFormFields((f) => ({
                            ...f,
                            accountHolderName: e.target.value,
                          }))
                        }
                        required
                        disabled={addMethodLoading}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={addFormFields.bankName}
                        onChange={(e) =>
                          setAddFormFields((f) => ({
                            ...f,
                            bankName: e.target.value,
                          }))
                        }
                        required
                        disabled={addMethodLoading}
                        placeholder="State Bank of India"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Account Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={addFormFields.accountNumber}
                        onChange={(e) =>
                          setAddFormFields((f) => ({
                            ...f,
                            accountNumber: e.target.value,
                          }))
                        }
                        required
                        disabled={addMethodLoading}
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={addFormFields.ifsc}
                        onChange={(e) =>
                          setAddFormFields((f) => ({
                            ...f,
                            ifsc: e.target.value.toUpperCase(),
                          }))
                        }
                        required
                        disabled={addMethodLoading}
                        placeholder="SBIN0001234"
                        maxLength={11}
                      />
                    </div>
                  </>
                )}

                {addMethodType === "upi" && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={addFormFields.upiId}
                      onChange={(e) =>
                        setAddFormFields((f) => ({
                          ...f,
                          upiId: e.target.value,
                        }))
                      }
                      required
                      disabled={addMethodLoading}
                      placeholder="yourname@paytm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your UPI ID (e.g., yourname@paytm, phone@upi)
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddMethod(false);
                      setAddFormFields({
                        bankName: "",
                        accountNumber: "",
                        ifsc: "",
                        accountHolderName: "",
                        upiId: "",
                      });
                    }}
                    disabled={addMethodLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={addMethodLoading}
                  >
                    {addMethodLoading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" /> Adding...
                      </span>
                    ) : (
                      "Add Method"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SellerLayout>
    </>
  );
}
