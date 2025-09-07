import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import Footer from "../../components/Footer";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  StarIcon,
  TagIcon,
  HomeIcon,
  CameraIcon,
  GiftIcon,
  HeartIcon,
  SparklesIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import QuotesCarousel from "../../components/QuotesCarousel";

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 2000],
    rating: 0,
    seller: "",
    inStock: false,
    hasCustomization: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, filters, searchTerm, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching All products from API...");
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched ok products:", data);
        setProducts(data.data?.results || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      console.log("Finished fetching products.");
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    console.log("Starting with products:", filtered.length);

    // ✅ FIXED: Enhanced search functionality
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          product.businessName?.toLowerCase().includes(searchLower) ||
          product.sellerName?.toLowerCase().includes(searchLower) ||
          (product.tags &&
            Array.isArray(product.tags) &&
            product.tags.some(
              (tag) =>
                typeof tag === "string" &&
                tag.toLowerCase().includes(searchLower)
            ))
        );
      });
    }

    // ✅ FIXED: Category filter
    if (filters.category && filters.category.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // ✅ FIXED: Price range filter (considers both regular and offer prices)
    filtered = filtered.filter((product) => {
      const effectivePrice = product.hasOffer
        ? product.offerPrice
        : product.price;
      const price = parseFloat(effectivePrice) || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // ✅ Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(
        (product) => (product.rating || 0) >= filters.rating
      );
    }

    // ✅ Stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => (product.stock || 0) > 0);
    }

    // ✅ Customization filter
    if (filters.hasCustomization) {
      filtered = filtered.filter(
        (product) =>
          product.customizationOptions &&
          Array.isArray(product.customizationOptions) &&
          product.customizationOptions.length > 0
      );
    }

    // ✅ FIXED: Sorting logic
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = a.hasOffer ? a.offerPrice || 0 : a.price || 0;
          const priceB = b.hasOffer ? b.offerPrice || 0 : b.price || 0;
          return parseFloat(priceA) - parseFloat(priceB);
        });
        break;

      case "price-high":
        filtered.sort((a, b) => {
          const priceA = a.hasOffer ? a.offerPrice || 0 : a.price || 0;
          const priceB = b.hasOffer ? b.offerPrice || 0 : b.price || 0;
          return parseFloat(priceB) - parseFloat(priceA);
        });
        break;

      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;

      case "newest":
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        break;

      case "popular":
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;

      case "alphabetical":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;

      case "featured":
      default:
        // Keep original order or sort by a combination of factors
        filtered.sort((a, b) => {
          // Featured products: high rating + high review count
          const scoreA = (a.rating || 0) * 0.7 + (a.reviewCount || 0) * 0.3;
          const scoreB = (b.rating || 0) * 0.7 + (b.reviewCount || 0) * 0.3;
          return scoreB - scoreA;
        });
        break;
    }

    console.log("Filtered and sorted products:", filtered.length);
    setFilteredProducts(filtered);
  };

  // Pagination logic
  const { currentProducts, totalPages, paginationInfo } = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const current = filteredProducts.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );
    const total = Math.ceil(filteredProducts.length / productsPerPage);

    return {
      currentProducts: current,
      totalPages: total,
      paginationInfo: {
        showing: current.length,
        total: filteredProducts.length,
        from: indexOfFirstProduct + 1,
        to: Math.min(indexOfLastProduct, filteredProducts.length),
      },
    };
  }, [filteredProducts, currentPage, productsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, 2000],
      rating: 0,
      seller: "",
      inStock: false,
      hasCustomization: false,
    });
    setSearchTerm("");
    setSortBy("featured");
    setCurrentPage(1);
  };

  // ✅ Enhanced search handler with debouncing
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const categories = [
    { name: "Custom Mugs", icon: GiftIcon, count: "120+" },
    { name: "Home Decor", icon: HomeIcon, count: "85+" },
    { name: "Photo Gifts", icon: CameraIcon, count: "95+" },
    { name: "Custom Jewelry", icon: SparklesIcon, count: "65+" },
    { name: "Custom T-Shirts", icon: TagIcon, count: "110+" },
    { name: "Wedding Gifts", icon: HeartIcon, count: "75+" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
                Loading Products
              </p>
              <p className="text-sm text-gray-500">
                Discovering amazing custom gifts for you...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Custom Gifts & Products - Desi Gifting</title>
        <meta
          name="description"
          content="Discover thousands of customizable gifts and products from talented artisans"
        />
        <meta
          name="keywords"
          content="custom gifts, personalized products, handmade, artisan crafts"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <SparklesIcon className="h-4 w-4" />
                <span>Premium Personalized Gifts</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                Create Custom{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Gifts
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Find the perfect personalized gift from our collection of
                heartcrafted products made with love
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => router.push("/products")}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Shopping
              </button>
              <button
                onClick={() => router.push("/seller/auth/register")}
                className="w-full sm:w-auto border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all duration-200"
              >
                Store Dashboard
              </button>
            </div>

            {/* Quick Stats */}
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for products, categories, or sellers..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="block w-full pl-10 sm:pl-12 pr-10 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  showFilters
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Filter */}

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange[0]}
                        onChange={(e) =>
                          handleFilterChange({
                            priceRange: [
                              parseInt(e.target.value) || 0,
                              filters.priceRange[1],
                            ],
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange[1]}
                        onChange={(e) =>
                          handleFilterChange({
                            priceRange: [
                              filters.priceRange[0],
                              parseInt(e.target.value) || 2000,
                            ],
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}

                  {/* Additional Options */}
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      Sort:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="popular">Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="alphabetical">Name: A to Z</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Results Count */}
                    <span className="text-xs sm:text-sm text-gray-500">
                      {paginationInfo.total > 0
                        ? `${paginationInfo.from}-${paginationInfo.to} of ${paginationInfo.total}`
                        : "No products"}
                    </span>

                    {/* View Mode Toggle - Hidden on mobile since we always use grid */}
                    <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "grid"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Squares2X2Icon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "list"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <ListBulletIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                    {searchTerm
                      ? `No results for "${searchTerm}". Try different keywords or filters.`
                      : "No products match your current filters. Try adjusting your search criteria."}
                  </p>
                  <div className="flex flex-col gap-3 px-4">
                    <button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors font-medium"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Browse Categories
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Products Grid - Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                    {currentProducts.map((product) => (
                      <div
                        key={product.id}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        <ProductCard
                          product={product}
                          viewMode="grid" // Force grid mode on mobile for consistency
                          className="h-full hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 sm:transform sm:hover:-translate-y-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 sm:mt-12 flex flex-col items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg border transition-colors ${
                            currentPage === 1
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        {/* Page Numbers - Show fewer on mobile */}
                        <div className="flex items-center gap-1">
                          {Array.from(
                            {
                              length: Math.min(
                                totalPages,
                                typeof window !== "undefined" &&
                                  window.innerWidth < 640
                                  ? 3
                                  : 5
                              ),
                            },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage <= 2) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 1) {
                                pageNum = totalPages - 2 + i;
                              } else {
                                pageNum = currentPage - 1 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                                    pageNum === currentPage
                                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg border transition-colors ${
                            currentPage === totalPages
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Footer />
          <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-10% border-t p-4 flex items-center justify-between z-50">
            <div>
              <QuotesCarousel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
