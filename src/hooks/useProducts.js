import { useProductStore } from '../stores/productStore';

export const useProducts = () => {
  const {
    products,
    filteredProducts,
    currentProduct,
    sellers,
    isLoading,
    lastDoc,
    hasMore,
    filters,
    availableTags,
    loadProducts,
    searchProducts,
    loadProductsBySeller,
    loadProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateFilters,
    applyFilters,
    clearFilters,
    loadSellers,
    setCurrentProduct,
    clearCurrentProduct
  } = useProductStore();

  return {
    products,
    filteredProducts,
    currentProduct,
    sellers,
    isLoading,
    lastDoc,
    hasMore,
    filters,
    availableTags,
    loadProducts,
    searchProducts,
    loadProductsBySeller,
    loadProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateFilters,
    applyFilters,
    clearFilters,
    loadSellers,
    setCurrentProduct,
    clearCurrentProduct
  };
};

// Hook for seller's products
export const useSellerProducts = (sellerId) => {
  const {
    products,
    isLoading,
    loadProductsBySeller,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProductStore();

  const loadProducts = () => {
    if (sellerId) {
      loadProductsBySeller(sellerId);
    }
  };

  return {
    products,
    isLoading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};

// Hook for single product
export const useProduct = (productId) => {
  const {
    currentProduct,
    isLoading,
    loadProduct,
    clearCurrentProduct
  } = useProductStore();

  const load = () => {
    if (productId) {
      loadProduct(productId);
    }
  };

  return {
    product: currentProduct,
    isLoading,
    loadProduct: load,
    clearProduct: clearCurrentProduct
  };
};
