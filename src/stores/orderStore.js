import { create } from 'zustand';
import firebaseServices from '../lib/firebaseServices';
import { notify, orderNotifications } from '../lib/notifications';

export const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  isLoading: false,
  isProcessing: false,

  // Actions
  loadBuyerOrders: async (buyerId) => {
    set({ isLoading: true });

    try {
      const result = await firebaseServices.order.getOrders({ buyerId });

      if (result.success) {
        set({ orders: result.data, isLoading: false });
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to load orders');
      }
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to load orders');
    }
  },

  loadSellerOrders: async (sellerId) => {
    set({ isLoading: true });

    try {
      const result = await firebaseServices.order.getOrders({ sellerId });

      if (result.success) {
        set({ orders: result.data, isLoading: false });
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to load orders');
      }
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to load orders');
    }
  },

  loadOrder: async (orderId) => {
    set({ isLoading: true });

    try {
      // Mock implementation - in production, you'd have a getOrder service
      const { orders } = get();
      const order = orders.find(o => o.id === orderId);

      if (order) {
        set({ currentOrder: order, isLoading: false });
        return { success: true, data: order };
      } else {
        set({ isLoading: false });
        return { success: false, error: 'Order not found' };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Failed to load order' };
    }
  },

  createOrder: async (orderData) => {
    set({ isProcessing: true });

    try {
      const result = await firebaseServices.order.createOrder(orderData);

      if (result.success) {
        // Add the new order to the list
        const newOrder = { id: result.id, ...orderData, status: 'pending' };
        const { orders } = get();
        set({ 
          orders: [newOrder, ...orders],
          isProcessing: false 
        });

        orderNotifications.orderPlaced(result.id);
      } else {
        set({ isProcessing: false });
        notify.error(result.error || 'Failed to create order');
      }

      return result;
    } catch (error) {
      set({ isProcessing: false });
      notify.error('Failed to create order');
      return { success: false, error: 'Failed to create order' };
    }
  },

  updateOrderStatus: async (orderId, status, notes = '', tracking = '') => {
    set({ isProcessing: true });

    try {
      const result = await firebaseServices.order.updateOrderStatus(orderId, status, notes, tracking);

      if (result.success) {
        const { orders } = get();
        const updatedOrders = orders.map(order => 
          order.id === orderId 
            ? { ...order, status, tracking: tracking || order.tracking, notes }
            : order
        );

        set({ 
          orders: updatedOrders,
          isProcessing: false 
        });

        // Show appropriate notification
        switch (status) {
          case 'confirmed':
            orderNotifications.orderConfirmed(orderId);
            break;
          case 'shipped':
            orderNotifications.orderShipped(orderId, tracking);
            break;
          case 'delivered':
            orderNotifications.orderDelivered(orderId);
            break;
          case 'cancelled':
            orderNotifications.orderCancelled(orderId);
            break;
          default:
            notify.success(`Order status updated to ${status}`);
        }
      } else {
        set({ isProcessing: false });
        notify.error(result.error || 'Failed to update order status');
      }

      return result;
    } catch (error) {
      set({ isProcessing: false });
      notify.error('Failed to update order status');
      return { success: false, error: 'Failed to update order status' };
    }
  },

  setCurrentOrder: (orderData) => {
    set({ currentOrder: orderData });
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },

  calculateOrderTotal: (products = [], customizations = {}) => {
    const subtotal = products.reduce((total, product) => {
      const basePrice = product.price * product.quantity;
      const productCustomizations = customizations[product.id] || {};

      const customizationPrice = Object.values(productCustomizations).reduce((custTotal, customization) => {
        return custTotal + (customization.price || 0);
      }, 0) * product.quantity;

      return total + basePrice + customizationPrice;
    }, 0);

    const tax = subtotal * 0.085; // 8.5% tax
    const shipping = subtotal >= 50 ? 0 : 5; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total
    };
  },

  getOrderStats: (orders) => {
    if (!orders || orders.length === 0) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      };
    }

    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };

    orders.forEach(order => {
      // Count by status
      stats[order.status] = (stats[order.status] || 0) + 1;

      // Calculate revenue (only for completed orders)
      if (['delivered', 'shipped'].includes(order.status)) {
        stats.totalRevenue += order.totalAmount || 0;
      }
    });

    // Calculate average order value
    const revenueOrders = orders.filter(o => ['delivered', 'shipped'].includes(o.status));
    stats.averageOrderValue = revenueOrders.length > 0 
      ? stats.totalRevenue / revenueOrders.length 
      : 0;

    return stats;
  },

  // Helper function to get order by ID
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find(order => order.id === orderId);
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    return get().updateOrderStatus(orderId, 'cancelled', reason);
  },

  // Get orders by status
  getOrdersByStatus: (status) => {
    const { orders } = get();
    return orders.filter(order => order.status === status);
  },

  // Search orders
  searchOrders: (searchTerm) => {
    const { orders } = get();

    if (!searchTerm) return orders;

    const term = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.id.toLowerCase().includes(term) ||
      order.buyerName?.toLowerCase().includes(term) ||
      order.products?.some(p => p.name.toLowerCase().includes(term)) ||
      order.status.toLowerCase().includes(term)
    );
  }
}));
