import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { useSellerDashboard } from "../../hooks/useSeller";

export default function SellerMilestones() {
  const [user] = useAuthState(auth);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);
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

  // Get stats with fallback values
  const stats = {
    totalOrders: profile?.sellerStats?.totalOrders || 47,
    totalcashback: profile?.sellerStats?.totalcashback || 25340,
    completedOrders: profile?.sellerStats?.completedOrders || 42,
  };

  const currentMilestone = Math.floor(stats.totalOrders / 150);
  const ordersToNext = 150 - (stats.totalOrders % 150);
  const progressPercentage = ((stats.totalOrders % 150) / 150) * 100;
  const nextMilestoneTarget = (currentMilestone + 1) * 150;
  const bonusAmount = 500 * (currentMilestone + 1);

  // Milestone history data
  const milestoneHistory = [
    {
      id: 1,
      ordersCompleted: 150,
      bonusEarned: 500,
      dateAchieved: "2025-08-15",
      status: stats.totalOrders >= 150 ? "completed" : "pending",
    },
    {
      id: 2,
      ordersCompleted: 300,
      bonusEarned: 1000,
      dateAchieved: stats.totalOrders >= 300 ? "2025-08-28" : null,
      status: stats.totalOrders >= 300 ? "completed" : "pending",
    },
    {
      id: 3,
      ordersCompleted: 450,
      bonusEarned: 1500,
      dateAchieved: null,
      status: "pending",
    },
  ];

  if (sellerDataLoading) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading milestones...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Order Milestones & Bonuses - DesiGifting Seller</title>
        <meta
          name="description"
          content="Track your order milestones and bonus rewards"
        />
      </Head>

      <SellerLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Order Milestones & Bonus Rewards
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Complete milestones to earn exclusive bonuses and rewards
            </p>
          </div>

          {/* Current Progress Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-emerald-100 shadow-sm">
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl sm:text-3xl">🎯</span>
                  </div>
                  {currentMilestone > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-xs sm:text-sm font-bold text-yellow-800">
                        {currentMilestone}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Current Progress
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Level {currentMilestone + 1} • {stats.totalOrders} total
                    orders
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="bg-yellow-100 text-yellow-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base">
                  🏆 Next Bonus: ₹{bonusAmount.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  {ordersToNext} orders remaining
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700">
                <span>Progress: {stats.totalOrders % 150}/150</span>
                <span className="text-emerald-600">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="relative w-full bg-gray-200 rounded-full h-4 sm:h-5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 h-4 sm:h-5 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-ping"></div>
                </div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                <span>{currentMilestone * 150} orders</span>
                <span>{nextMilestoneTarget} orders</span>
              </div>
            </div>

            {/* Stats Row - Mobile: 1 column, Tablet+: 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/50">
              <div className="text-center bg-white/50 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {stats.totalOrders}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Orders Completed
                </div>
              </div>
              <div className="text-center bg-white/50 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  ₹{"0"}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Cashback Earned
                </div>
              </div>
              <div className="text-center bg-white/50 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {currentMilestone}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Milestones Achieved
                </div>
              </div>
            </div>
          </div>

          {/* Milestone History */}
          <div className="bg-white rounded-xl shadow-sm border mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Milestones
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Your journey to bigger rewards
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Generate upcoming milestones dynamically */}
                {Array.from({ length: 5 }, (_, index) => {
                  const milestoneNumber = currentMilestone + index + 1;
                  const ordersRequired = milestoneNumber * 150;
                  const bonusAmount = 500 * milestoneNumber;
                  const ordersFromCurrent = ordersRequired - stats.totalOrders;
                  const isNext = index === 0;

                  return (
                    <div
                      key={milestoneNumber}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        isNext
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isNext
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isNext ? "🎯" : "🏆"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              Milestone {milestoneNumber}
                            </h4>
                            {isNext && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                NEXT
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Complete {ordersRequired} orders total
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs font-medium ${
                                isNext ? "text-blue-600" : "text-gray-500"
                              }`}
                            >
                              {ordersFromCurrent} orders to go
                            </span>
                            {isNext && (
                              <div className="flex-1 max-w-24 sm:max-w-32">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${Math.max(
                                        0,
                                        ((150 - ordersFromCurrent) / 150) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right ml-13 sm:ml-0">
                        <div
                          className={`font-bold text-lg ${
                            isNext ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          ₹{bonusAmount.toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Bonus Reward
                        </div>
                        {isNext && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            🔥{" "}
                            {(((150 - ordersFromCurrent) / 150) * 100).toFixed(
                              0
                            )}
                            % there!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Motivational Footer */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">💪</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                      Keep Going!
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Each completed order brings you closer to your next bonus
                      milestone
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - New section to motivate action */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-emerald-100 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-emerald-800 mb-3 sm:mb-4">
              🚀 Boost Your Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => router.push("/seller/products/add")}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">📦</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800 text-sm">
                    Add Products
                  </div>
                  <div className="text-xs text-gray-600">
                    More products = more orders
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/seller/analytics")}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">📊</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800 text-sm">
                    View Analytics
                  </div>
                  <div className="text-xs text-gray-600">
                    Optimize your performance
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bonus Information */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100">
            <h3 className="text-base sm:text-lg font-bold text-purple-800 mb-3 sm:mb-4">
              💡 How Bonus Rewards Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                  Milestone Requirements
                </h4>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <li>• Complete orders must be delivered successfully</li>
                  <li>• Orders must maintain quality standards</li>
                  <li>• Customer satisfaction rating above 4.0</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                  Reward Structure
                </h4>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <li>• Bonus increases with each milestone</li>
                  <li>• Payments processed within 3-5 business days</li>
                  <li>• Additional perks unlock at higher levels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    </>
  );
}
