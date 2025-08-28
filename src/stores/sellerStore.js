import { create } from 'zustand';
import firebaseServices from '../lib/firebaseServices';
import { notify } from '../lib/notifications';
import { auth } from "../lib/firebase";

export const useSellerStore = create((set, get) => ({
  // State
  profile: null,
  analytics: null,
  dashboardStats: null,
  isLoading: false,

  // Actions
  loadProfile: async (sellerId) => {
    set({ isLoading: true });

    try {
      console.log("Loooding profile for seller ID:", sellerId);
      const result = await firebaseServices.user.getSellerProfile(sellerId);

      if (result.success) {
        set({ profile: result.data, isLoading: false });
        console.log("Loooded seller profile:", result.data);
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to load seller profile');
      }
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to load seller profile');
    }
  },

  updateProfile: async (sellerId, updates) => {
    set({ isLoading: true });
    try {
      const result = await firebaseServices.user.updateProfile(sellerId, updates);
      if (result.success) {
        const { profile } = get();
        set({ 
          profile: { ...profile, ...updates },
          isLoading: false 
        });
        notify.success('Profile updated successfully');
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to update profile');
      }

      return result;
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to update profile');
      return { success: false, error: 'Failed to update profile' };
    }
  },

  loadAnalytics: async (sellerId, period = 'month') => {
    set({ isLoading: true });

    try {
      // Mock analytics data - in production, this would come from Firebase
      const mockAnalytics = {
        period,
        revenue: {
          current: 12580,
          previous: 11240,
          growth: 11.9
        },
        orders: {
          current: 156,
          previous: 142,
          growth: 9.9
        },
        customers: {
          current: 89,
          previous: 76,
          growth: 17.1
        },
        averageOrderValue: {
          current: 80.64,
          previous: 79.15,
          growth: 1.9
        },
        topProducts: [
          { id: '1', name: 'Custom Mug', sales: 45, revenue: 1125 },
          { id: '2', name: 'Photo Frame', sales: 32, revenue: 960 },
          { id: '3', name: 'T-Shirt Design', sales: 28, revenue: 840 },
          { id: '4', name: 'Phone Case', sales: 25, revenue: 500 },
          { id: '5', name: 'Canvas Print', sales: 20, revenue: 800 }
        ],
        revenueChart: [
          { date: '2024-01', revenue: 1200, orders: 15 },
          { date: '2024-02', revenue: 1800, orders: 22 },
          { date: '2024-03', revenue: 2100, orders: 28 },
          { date: '2024-04', revenue: 1950, orders: 25 },
          { date: '2024-05', revenue: 2400, orders: 32 },
          { date: '2024-06', revenue: 2800, orders: 38 }
        ],
        customerSegments: [
          { name: 'New Customers', value: 45, count: 40 },
          { name: 'Returning Customers', value: 35, count: 31 },
          { name: 'VIP Customers', value: 20, count: 18 }
        ],
        trafficSources: [
          { name: 'Direct', visitors: 1250, percentage: 42 },
          { name: 'Search', visitors: 890, percentage: 30 },
          { name: 'Social Media', visitors: 520, percentage: 18 },
          { name: 'Referral', visitors: 300, percentage: 10 }
        ]
      };

      set({ analytics: mockAnalytics, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to load analytics');
    }
  },

  // getDashboardStats: async (sellerId) => {
  //   try {
  //     // Mock dashboard stats - in production, this would be calculated from real data
  //     const stats = {
  //       totalRevenue: 12580,
  //       totalOrders: 156,
  //       totalProducts: 24,
  //       averageOrderValue: 80.64,
  //       pendingOrders: 8,
  //       completedOrders: 148,
  //       storeViews: 2847,
  //       rating: 4.8,
  //       reviewCount: 89
  //     };

  //     set({ dashboardStats: stats });
  //     return { success: true, stats };
  //   } catch (error) {
  //     notify.error('Failed to load dashboard stats');
  //     return { success: false, error: 'Failed to load dashboard stats' };
  //   }
  // },

  // getDashboardStats function with real database integration
getDashboardStats: async (sellerId) => {
  set({ isLoading: true });

  try {
    // Get authenticated user token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }

    const idToken = await user.getIdToken();

    // Fetch dashboard stats from API
    const response = await fetch(`/api/seller?uid=${user.uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to load dashboard stats');
    }

    if (result.success) {
      const stats = result.data;
      
      // Calculate additional metrics from the raw data
      // const enhancedStats = {
      //   ...stats,
      //   // Calculate average order value if not provided
      //   averageOrderValue: stats.totalOrders > 0 
      //     ? parseFloat((stats.totalRevenue / stats.totalOrders).toFixed(2))
      //     : 0,

      //   // Calculate monthly revenue growth if previous month data exists
      //   monthlyGrowth: stats.previousMonthRevenue 
      //     ? parseFloat(((stats.monthlyRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue * 100).toFixed(1))
      //     : 0,

      //   // Add recent orders if included in response
      //   recentOrders: stats.recentOrders || [],

      //   // Add timestamp for cache management
      //   lastUpdated: new Date().toISOString()
      // };

      set({ 
        dashboardStats: stats,
        isLoading: false 
      });

      return { success: true, data: stats };

    } else {
      throw new Error(result.error || 'Failed to load dashboard stats');
    }

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    
    // On error, try to use cached data or fallback to mock data
    const { dashboardStats } = get();
    
    if (dashboardStats && dashboardStats.lastUpdated) {
      // Use cached data if it's less than 1 hour old
      const cacheAge = Date.now() - new Date(dashboardStats.lastUpdated).getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (cacheAge < oneHour) {
        set({ isLoading: false });
        notify.warning('Using cached dashboard data');
        return { success: true, data: dashboardStats, cached: true };
      }
    }

    // Fallback to mock data with warning
    const mockStats = {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      monthlyRevenue: 0,
      storeViews: 0,
      rating: 0,
      reviewCount: 0,
      completionRate: 0,
      monthlyGrowth: 0,
      recentOrders: [],
      lastUpdated: new Date().toISOString(),
      isMockData: true
    };

    set({ 
      dashboardStats: mockStats,
      isLoading: false 
    });

    notify.error('Failed to load dashboard stats. Showing default values.');
    return { 
      success: false, 
      error: error.message,
      data: mockStats 
    };
  }
},



  uploadSellerAssets: async (sellerId, files, type = 'logo') => {
    set({ isLoading: true });

    try {
      // Mock upload - in production, this would use Firebase Storage
      const mockUrls = {
        logo: 'https://via.placeholder.com/150x150?text=Logo',
        banner: 'https://via.placeholder.com/800x200?text=Banner'
      };

      const updates = {
        [type]: mockUrls[type]
      };

      const result = await get().updateProfile(sellerId, updates);

      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to upload asset');
      return { success: false, error: 'Failed to upload asset' };
    }
  },

  // Revenue calculations
  calculateRevenueGrowth: (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  },

  // Get revenue by period
  getRevenuByPeriod: (period = 'month') => {
    const { analytics } = get();
    if (!analytics) return null;

    return analytics.revenueChart || [];
  },

  // Get top performing products
  getTopProducts: (limit = 5) => {
    const { analytics } = get();
    if (!analytics) return [];

    return analytics.topProducts?.slice(0, limit) || [];
  },

  // Export analytics data
  exportAnalytics: async (sellerId, period, format = 'csv') => {
    try {
      const { analytics } = get();
      if (!analytics) {
        notify.error('No analytics data to export');
        return { success: false };
      }

      // Mock export - in production, this would generate actual files
      notify.success(`Analytics exported as ${format.toUpperCase()}`);
      return { success: true };
    } catch (error) {
      notify.error('Failed to export analytics');
      return { success: false, error: 'Failed to export analytics' };
    }
  },

  // Clear analytics data
  clearAnalytics: () => {
    set({ analytics: null });
  },

  // Update seller verification status
  updateVerificationStatus: async (sellerId, isVerified) => {
    try {
      const result = await get().updateProfile(sellerId, { isVerified });
      return result;
    } catch (error) {
      notify.error('Failed to update verification status');
      return { success: false, error: 'Failed to update verification status' };
    }
  },

  // Get seller performance metrics
  getPerformanceMetrics: () => {
    const { profile, analytics } = get();

    if (!profile || !analytics) return null;

    return {
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || 0,
      totalOrders: profile.sellerStats?.totalOrders || 0,
      totalRevenue: profile.sellerStats?.totalRevenue || 0,
      responseRate: 98, // Mock data
      onTimeDelivery: 95, // Mock data
      customerSatisfaction: 4.8 // Mock data
    };
  }
}));
