import { create } from 'zustand';
import firebaseServices from '../lib/firebaseServices';
import { notify } from '../lib/notifications';

export const useProductStore = create((set, get) => ({
  // State
  products: [],
  filteredProducts: [],
  currentProduct: null,
  sellers: [],
  isLoading: false,
  lastDoc: null,
  hasMore: true,
  filters: {
    search: '',
    tags: [],
    seller: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'newest'
  },
  availableTags: [
    'Custom Mugs',
    'Personalized T-Shirts',
    'Photo Frames',
    'Phone Cases',
    'Canvas Prints',
    'Wall Art',
    'Jewelry',
    'Home Decor',
    'Wedding Gifts',
    'Birthday Gifts',
    'Anniversary Gifts',
    'Baby Gifts',
    'Pet Accessories',
    'Office Supplies',
    'Holiday Items',
    'Kitchen Items',
    'Art & Crafts',
    'Tech Accessories',
    'Fashion',
    'Sports & Fitness'
  ],

  // Actions
  loadProducts: async (reset = true) => {
    const { lastDoc, hasMore, products } = get();

    if (!hasMore && !reset) return;

    set({ isLoading: true });

    try {
      const result = await firebaseServices.product.getProducts(
        { limit: 20 },
        reset ? null : lastDoc
      );

      if (result.success) {
        const newProducts = reset ? result.data : [...products, ...result.data];

        set({ 
          products: newProducts,
          filteredProducts: newProducts,
          lastDoc: result.lastDoc,
          hasMore: result.data.length === 20,
          isLoading: false 
        });

        // Apply current filters
        get().applyFilters();
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to load products');
      }
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to load products');
    }
  },

  searchProducts: async (searchTerm, additionalFilters = {}) => {
    const { products } = get();

    set({ isLoading: true });

    // For now, implement client-side search
    // In production, you'd want server-side search with Algolia or similar
    const filtered = products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      // Apply additional filters
      let matchesFilters = true;

      if (additionalFilters.tags && additionalFilters.tags.length > 0) {
        matchesFilters = matchesFilters && product.tags && 
          additionalFilters.tags.some(tag => product.tags.includes(tag));
      }

      if (additionalFilters.seller) {
        matchesFilters = matchesFilters && product.sellerId === additionalFilters.seller;
      }

      if (additionalFilters.minPrice) {
        matchesFilters = matchesFilters && product.price >= additionalFilters.minPrice;
      }

      if (additionalFilters.maxPrice) {
        matchesFilters = matchesFilters && product.price <= additionalFilters.maxPrice;
      }

      return matchesSearch && matchesFilters;
    });

    set({ 
      filteredProducts: filtered,
      isLoading: false,
      filters: { ...get().filters, search: searchTerm, ...additionalFilters }
    });
  },

  loadProductsBySeller: async (sellerId) => {
    set({ isLoading: true });

    try {
      const result = await firebaseServices.product.getProducts({ sellerId, limit: 100 });

      if (result.success) {
        set({ 
          products: result.data,
          filteredProducts: result.data,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to load seller products');
      }
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to load seller products');
    }
  },

  loadProduct: async (id) => {
    set({ isLoading: true });

    try {
      const result = await firebaseServices.product.getProduct(id);

      if (result.success) {
        set({ currentProduct: result.data, isLoading: false });
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Product not found');
      }

      return result;
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to load product');
      return { success: false, error: 'Failed to load product' };
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true });

    try {
      const result = await firebaseServices.product.createProduct(productData);

      if (result.success) {
        // Reload products to include the new one
        await get().loadProducts(true);
        notify.success('Product created successfully!');
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to create product');
      }

      return result;
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to create product');
      return { success: false, error: 'Failed to create product' };
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true });

    try {
      const result = await firebaseServices.product.updateProduct(id, updates);

      if (result.success) {
        const { products, filteredProducts } = get();

        // Update product in both arrays
        const updatedProducts = products.map(p => 
          p.id === id ? { ...p, ...updates } : p
        );
        const updatedFiltered = filteredProducts.map(p => 
          p.id === id ? { ...p, ...updates } : p
        );

        set({ 
          products: updatedProducts,
          filteredProducts: updatedFiltered,
          isLoading: false 
        });

        notify.success('Product updated successfully!');
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to update product');
      }

      return result;
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to update product');
      return { success: false, error: 'Failed to update product' };
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });

    try {
      const result = await firebaseServices.product.deleteProduct(id);

      if (result.success) {
        const { products, filteredProducts } = get();

        // Remove product from both arrays
        const updatedProducts = products.filter(p => p.id !== id);
        const updatedFiltered = filteredProducts.filter(p => p.id !== id);

        set({ 
          products: updatedProducts,
          filteredProducts: updatedFiltered,
          isLoading: false 
        });

        notify.success('Product deleted successfully!');
      } else {
        set({ isLoading: false });
        notify.error(result.error || 'Failed to delete product');
      }

      return result;
    } catch (error) {
      set({ isLoading: false });
      notify.error('Failed to delete product');
      return { success: false, error: 'Failed to delete product' };
    }
  },

  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().applyFilters();
  },

  applyFilters: () => {
    const { products, filters } = get();

    let filtered = [...products];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(filters.search.toLowerCase())
        ))
      );
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(product => 
        product.tags && filters.tags.some(tag => product.tags.includes(tag))
      );
    }

    // Apply seller filter
    if (filters.seller) {
      filtered = filtered.filter(product => product.sellerId === filters.seller);
    }

    // Apply price range filter
    if (filters.minPrice > 0) {
      filtered = filtered.filter(product => product.price >= filters.minPrice);
    }

    if (filters.maxPrice < 1000) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.totalSales || 0) - (a.totalSales || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          // Handle different date formats
          const aTime = a.createdAt?.seconds || a.createdAt?.getTime?.() || 0;
          const bTime = b.createdAt?.seconds || b.createdAt?.getTime?.() || 0;
          return bTime - aTime;
      }
    });

    set({ filteredProducts: filtered });
  },

  clearFilters: () => {
    const defaultFilters = {
      search: '',
      tags: [],
      seller: '',
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'newest'
    };

    set({ filters: defaultFilters });
    get().applyFilters();
  },

  loadSellers: async () => {
    // Mock sellers data - in production, this would be a separate collection
    const mockSellers = [
      { id: 'seller1', name: 'Custom Creations Co.', rating: 4.8 },
      { id: 'seller2', name: 'Artisan Gifts', rating: 4.6 },
      { id: 'seller3', name: 'Personal Touch', rating: 4.9 },
      { id: 'seller4', name: 'Gift Masters', rating: 4.7 },
    ];

    set({ sellers: mockSellers });
  },

  setCurrentProduct: (product) => {
    set({ currentProduct: product });
  },

  clearCurrentProduct: () => {
    set({ currentProduct: null });
  }
}));
