// Export all stores
export { useAuthStore } from './authStore';
export { useProductStore } from './productStore';
export { useOrderStore } from './orderStore';
export { useSellerStore } from './sellerStore';

// Store initialization
import { useAuthStore } from './authStore';

// Initialize auth store on app start
export const initializeStores = () => {
  // Initialize auth state
  useAuthStore.getState().initialize();
};
