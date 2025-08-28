import { useOrderStore } from '../stores/orderStore';

export const useOrders = () => {
  const {
    orders,
    currentOrder,
    isLoading,
    isProcessing,
    loadBuyerOrders,
    loadSellerOrders,
    loadOrder,
    createOrder,
    updateOrderStatus,
    setCurrentOrder,
    clearCurrentOrder,
    calculateOrderTotal,
    getOrderStats,
    getOrderById,
    cancelOrder,
    getOrdersByStatus,
    searchOrders
  } = useOrderStore();

  return {
    orders,
    currentOrder,
    isLoading,
    isProcessing,
    loadBuyerOrders,
    loadSellerOrders,
    loadOrder,
    createOrder,
    updateOrderStatus,
    setCurrentOrder,
    clearCurrentOrder,
    calculateOrderTotal,
    getOrderStats,
    getOrderById,
    cancelOrder,
    getOrdersByStatus,
    searchOrders
  };
};

// Hook for buyer orders
export const useBuyerOrders = (buyerId) => {
  const {
    orders,
    isLoading,
    loadBuyerOrders,
    cancelOrder
  } = useOrderStore();

  const loadOrders = () => {
    if (buyerId) {
      loadBuyerOrders(buyerId);
    }
  };

  return {
    orders,
    isLoading,
    loadOrders,
    cancelOrder
  };
};

// Hook for seller orders
export const useSellerOrders = (sellerId) => {
  const {
    orders,
    isLoading,
    loadSellerOrders,
    updateOrderStatus,
    getOrderStats
  } = useOrderStore();

  const loadOrders = () => {
    if (sellerId) {
      loadSellerOrders(sellerId);
    }
  };

  const stats = getOrderStats(orders);

  return {
    orders,
    stats,
    isLoading,
    loadOrders,
    updateOrderStatus
  };
};
