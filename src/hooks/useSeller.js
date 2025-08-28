import { useSellerStore } from '../stores/sellerStore';

export const useSeller = () => {
  const {
    profile,
    analytics,
    dashboardStats,
    isLoading,
    loadProfile,
    updateProfile,
    loadAnalytics,
    getDashboardStats,
    uploadSellerAssets,
    calculateRevenueGrowth,
    getRevenuByPeriod,
    getTopProducts,
    exportAnalytics,
    clearAnalytics,
    updateVerificationStatus,
    getPerformanceMetrics
  } = useSellerStore();

  return {
    profile,
    analytics,
    dashboardStats,
    isLoading,
    loadProfile,
    updateProfile,
    loadAnalytics,
    getDashboardStats,
    uploadSellerAssets,
    calculateRevenueGrowth,
    getRevenuByPeriod,
    getTopProducts,
    exportAnalytics,
    clearAnalytics,
    updateVerificationStatus,
    getPerformanceMetrics
  };
};

// Hook for seller analytics
export const useSellerAnalytics = (sellerId) => {
  const {
    analytics,
    isLoading,
    loadAnalytics,
    getRevenuByPeriod,
    getTopProducts,
    exportAnalytics
  } = useSellerStore();

  const loadData = (period = 'month') => {
    if (sellerId) {
      loadAnalytics(sellerId, period);
    }
  };

  return {
    analytics,
    isLoading,
    loadAnalytics: loadData,
    getRevenuByPeriod,
    getTopProducts,
    exportAnalytics
  };
};

// Hook for seller dashboard
export const useSellerDashboard = (sellerId) => {
  const {
    profile,
    dashboardStats,
    isLoading,
    loadProfile,
    getDashboardStats,
    getPerformanceMetrics
  } = useSellerStore();

  const loadData = () => {
    if (sellerId) {
      loadProfile(sellerId);
    }
  };

  const metrics = getPerformanceMetrics();

  return {
    profile,
    dashboardStats,
    metrics,
    isLoading,
    loadData
  };
};
