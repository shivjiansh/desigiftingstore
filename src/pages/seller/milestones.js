import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { useSellerDashboard } from "../../hooks/useSeller";
import {ArrowUpIcon} from "@heroicons/react/24/outline";

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
    totalOrders: profile?.sellerStats?.totalOrders || 0,
    totalcashback: profile?.sellerStats?.totalcashback || 0,
    completedOrders: profile?.sellerStats?.completedOrders || 0,
  };

  const currentMilestone = Math.floor(stats.totalOrders / 150);
  const ordersToNext = 150 - (stats.totalOrders % 150);
  const progressPercentage = ((stats.totalOrders % 150) / 150) * 100;
  const nextMilestoneTarget = (currentMilestone + 1) * 150;
  const bonusAmount = 500 * (currentMilestone + 1);
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
        <title>Anniversary Milestones & Bonuses - DesiGifting Seller</title>
        <meta
          name="description"
          content="Celebrating 1 year of Desigifting with exclusive milestone bonuses and cashback rewards"
        />
      </Head>

      <SellerLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
          {/* Anniversary Celebration Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 mb-8 border border-amber-200 shadow-lg">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-20"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-gradient-to-tr from-red-300 to-pink-400 rounded-full opacity-15"></div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-amber-200">
                  <span className="text-xl">🎉</span>
                  <span>ANNIVERSARY CELEBRATION</span>
                  <span className="text-xl">🎊</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  Celebrating{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-600">
                    One Amazing Year
                  </span>
                </h1>

                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  It's been an incredible journey since we launched Desigifting!
                  To celebrate our 1st anniversary and thank our amazing seller
                  community, we're introducing our exclusive
                  <strong className="text-amber-700">
                    {" "}
                    5-Milestone Bonus Program
                  </strong>{" "}
                  with enhanced cashback rewards.
                </p>
              </div>

              {/* Anniversary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50">
                  <div className="text-2xl mb-2">🎂</div>
                  <div className="text-2xl font-bold text-amber-700">365</div>
                  <div className="text-sm text-gray-600">Days of Growth</div>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-2xl font-bold text-orange-700">5</div>
                  <div className="text-sm text-gray-600">Milestone Levels</div>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-red-200/50">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-red-700">₹12.5K</div>
                  <div className="text-sm text-gray-600">
                    Max Bonus Potential
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 italic">
                  "Thank you for being part of our success story. Here's to many
                  more years together!"
                  <span className="block mt-1 font-semibold text-gray-700">
                    - The Desigifting Team
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Program Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 mb-8 border border-blue-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Anniversary Milestone Program
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                As part of our 1-year anniversary celebration, we've designed an
                exclusive 5-tier milestone program that rewards your dedication
                with substantial cashback bonuses and exclusive benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-5 border border-blue-200/50">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">🎯</span>
                  Program Highlights
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      5 progressive milestone levels (150 orders each)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Cashback bonuses from ₹500 to ₹2,500 per milestone
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>
                      Total earning potential up to ₹12,500 in bonuses
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Exclusive anniversary perks and recognition</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-5 border border-blue-200/50">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-purple-600">⏰</span>
                  Program Timeline
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>
                      <strong>Launch:</strong> September 2025 (Anniversary
                      Month)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>
                      <strong>Duration:</strong> 6 months from enrollment
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>
                      <strong>Payouts:</strong> Within 5 business days of
                      milestone completion
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>
                      <strong>Eligibility:</strong> All active sellers
                      automatically enrolled
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Progress Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-emerald-100 shadow-sm">
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
                    Your Anniversary Journey
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Milestone {currentMilestone + 1} • {stats.totalOrders} total
                    orders completed
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base border border-amber-200">
                  🎉 Next Bonus: ₹{bonusAmount.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  {ordersToNext} orders until your next anniversary reward
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700">
                <span>Current Progress: {stats.totalOrders % 150}/150</span>
                <span className="text-emerald-600">
                  {progressPercentage.toFixed(1)}% Complete
                </span>
              </div>

              <div className="relative w-full bg-gray-200 rounded-full h-4 sm:h-5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-4 sm:h-5 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-ping"></div>
                </div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                <span>{currentMilestone * 150} orders</span>
                <span>
                  {nextMilestoneTarget} orders (Milestone {currentMilestone + 1}
                  )
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/50">
              <div className="text-center bg-white/50 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {stats.totalOrders}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Anniversary Orders
                </div>
              </div>
              <div className="text-center bg-white/50 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  ₹
                  {(
                    (currentMilestone * 500 * (currentMilestone + 1)) /
                    2
                  ).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Bonus Earned
                </div>
              </div>
              <div className="text-center bg-white/50 rounded-lg p-3 sm:p-0 sm:bg-transparent">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {currentMilestone}/5
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Milestones Achieved
                </div>
              </div>
            </div>
          </div>

          {/* Anniversary Milestone Roadmap */}
          <div className="bg-white rounded-xl shadow-sm border mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>🎊</span>
                Anniversary Milestone Roadmap
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your exclusive 5-tier journey with escalating rewards
                celebrating our 1st anniversary
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 5 }, (_, index) => {
                  const milestoneNumber = index + 1;
                  const ordersRequired = milestoneNumber * 150;
                  const bonusAmount = 500 * milestoneNumber;
                  const ordersFromCurrent = ordersRequired - stats.totalOrders;
                  const isCompleted = stats.totalOrders >= ordersRequired;
                  const isNext =
                    !isCompleted &&
                    ordersFromCurrent ===
                      Math.min(
                        ...Array.from({ length: 5 }, (_, i) => {
                          const req = (i + 1) * 150;
                          return req > stats.totalOrders
                            ? req - stats.totalOrders
                            : Infinity;
                        })
                      );

                  return (
                    <div
                      key={milestoneNumber}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-4 rounded-xl border-2 transition-all ${
                        isCompleted
                          ? "bg-green-50 border-green-200 ring-2 ring-green-100"
                          : isNext
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? "bg-green-100 text-green-600"
                              : isNext
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isCompleted ? "✅" : isNext ? "🎯" : "🏆"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              Anniversary Milestone {milestoneNumber}
                            </h4>
                            {isCompleted && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                COMPLETED 🎉
                              </span>
                            )}
                            {isNext && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                CURRENT TARGET
                              </span>
                            )}
                            {milestoneNumber === 5 && !isCompleted && (
                              <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                GRAND FINALE
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Complete {ordersRequired} total orders •
                            <span className="font-medium text-gray-800">
                              {" "}
                              {isCompleted
                                ? "Achieved!"
                                : `${ordersFromCurrent} orders remaining`}
                            </span>
                          </p>
                          {isNext && !isCompleted && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 max-w-32 sm:max-w-40">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${Math.max(
                                        0,
                                        ((150 - ordersFromCurrent) / 150) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs font-medium text-blue-600">
                                {(
                                  ((150 - ordersFromCurrent) / 150) *
                                  100
                                ).toFixed(0)}
                                % complete
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right ml-15 sm:ml-0">
                        <div
                          className={`font-bold text-xl ${
                            isCompleted
                              ? "text-green-600"
                              : isNext
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          ₹{bonusAmount.toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Anniversary Bonus
                        </div>
                        {isCompleted && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            🎉 Bonus Earned!
                          </div>
                        )}
                        {milestoneNumber === 5 && (
                          <div className="text-xs text-purple-600 font-medium mt-1">
                            👑 Ultimate Reward
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Motivational Footer */}
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                      Keep the Anniversary Spirit Alive!
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Every order completed is a step closer to your next
                      anniversary milestone. Thank you for making our first year
                      incredible!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anniversary Action Center */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-emerald-100 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span>🎯</span>
              Anniversary Action Center
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Maximize your milestone progress with these proven strategies from
              our anniversary celebration guide.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => router.push("/seller/products/add")}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">📦</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800 text-sm">
                    Add Products
                  </div>
                  <div className="text-xs text-gray-600">
                    Expand your catalog for more orders
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/seller/analytics")}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">📊</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800 text-sm">
                    Performance Analytics
                  </div>
                  <div className="text-xs text-gray-600">
                    Optimize for milestone success
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Anniversary Program Terms */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100">
            <h3 className="text-base sm:text-lg font-bold text-purple-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span>📋</span>
              Anniversary Program Terms & Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-1">
                  <span className="text-blue-600">✓</span>
                  Qualification Criteria
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                  <li>• Orders must be successfully delivered and confirmed</li>
                  <li>
                    • Maintain minimum 4.0-star customer satisfaction rating
                  </li>
                  <li>
                    • Account must remain in good standing throughout program
                  </li>
                  <li>
                    • Anniversary program active from Sept 2025 - March 2026
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-1">
                  <span className="text-green-600">🎁</span>
                  Exclusive Anniversary Benefits
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                  <li>
                    • Progressive bonus structure (₹500 to ₹2,500 per milestone)
                  </li>
                  <li>
                    • Fast-track payment processing within 5 business days
                  </li>
                  <li>• Special anniversary seller badges and recognition</li>
                  <li>
                    • Priority customer support and dedicated success manager
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/70 rounded-lg border border-purple-200/50">
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                <strong className="text-purple-700">
                  Anniversary Special:
                </strong>{" "}
                This milestone program is our way of saying thank you for an
                incredible first year. All bonuses are additional to your
                regular earnings and commission structure.
                <span className="block mt-2 font-medium text-gray-700">
                  Happy 1st Anniversary from all of us at Desigifting! 🎉
                </span>
              </p>
            </div>
          </div>
        </div>
        <button
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-4 w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                        aria-label="Back to top"
                      >
                        <ArrowUpIcon className="h-5 w-5" />
                      </button>
      </SellerLayout>
    </>
  );
}
