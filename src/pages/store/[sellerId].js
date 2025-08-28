import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  HeartIcon,
  ShareIcon,
  BuildingOfficeIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";

export default function SellerStorePage() {
  const router = useRouter();
  const { sellerId } = router.query;

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, sortBy]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // Fetch seller profile
      const sellerResponse = await fetch(`/api/store/${sellerId}`);
      const sellerResult = await sellerResponse.json();

      if (sellerResult.success) {
        setSeller(sellerResult.data);
      }

      // Fetch seller products
      const productsResponse = await fetch(
        `/api/products?sellerId=${sellerId}`
      );
      const productsResult = await productsResponse.json();

      if (productsResult.success) {
        setProducts(productsResult.data.results || []);
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "popular":
          return (b.totalSales || 0) - (a.totalSales || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(
        i < fullStars ? (
          <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
        ) : (
          <StarIcon key={i} className="w-5 h-5 text-gray-300" />
        )
      );
    }
    return stars;
  };

  const shareStore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${seller.businessName} - Custom Gifts Store`,
          text: seller.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Store link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Store Not Found
          </h1>
          <Link href="/sellers" className="text-blue-600 hover:text-blue-700">
            ← Browse All Sellers
          </Link>
        </div>
      </div>
    );
  }

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <>
      <Head>
        <title>{seller.businessName} - Custom Gifts Store</title>
        <meta name="description" content={seller.description} />
        <meta
          property="og:title"
          content={`${seller.businessName} - Custom Gifts Store`}
        />
        <meta property="og:description" content={seller.description} />
        <meta property="og:image" content={seller.bannerImage || seller.logo} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Store Header */}
        <div className="relative">
          {/* Banner */}
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            {seller.bannerImage ? (
              <Image
                src={seller.bannerImage}
                alt={`${seller.businessName} banner`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20" />

            {/* Back Button */}
            <div className="absolute top-6 left-6">
              <button
                onClick={() => router.back()}
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Share Button */}
            <div className="absolute top-6 right-6">
              <button
                onClick={shareStore}
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Store Info Overlay */}
          <div className="relative bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 pb-8">
                {/* Logo */}
                <div className="relative mb-4 md:mb-0 md:mr-6">
                  <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-xl overflow-hidden">
                    {seller.logo ? (
                      <Image
                        src={seller.logo}
                        alt={`${seller.businessName} logo`}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <BuildingOfficeIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {seller.isVerified && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-green-500 text-white p-2 rounded-full">
                        <CheckBadgeIcon className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Store Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {seller.businessName}
                      </h1>
                      <p className="text-lg text-gray-600 mb-2">
                        {seller.name}
                      </p>

                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                          {renderStars(seller.rating || 0)}
                          <span className="ml-2 text-gray-600">
                            {seller.rating?.toFixed(1)} (
                            {seller.reviewCount || 0} reviews)
                          </span>
                        </div>

                        {seller.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {seller.location}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 max-w-2xl">
                        {seller.description}
                      </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex space-x-3">
                      <button
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                          isFollowing
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <HeartIconSolid className="w-5 h-5 inline mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <HeartIcon className="w-5 h-5 inline mr-2" />
                            Follow
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowContactModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Stats */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {products.length}
                </div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {seller.totalSales || 0}
                </div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {seller.yearsActive || 0}
                </div>
                <div className="text-sm text-gray-600">Years Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {seller.responseTime || "2h"}
                </div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {seller.satisfactionRate || "98"}%
                </div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Features */}
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-center space-x-8 text-sm">
              <div className="flex items-center text-blue-700">
                <TruckIcon className="w-4 h-4 mr-2" />
                Free Shipping Available
              </div>
              <div className="flex items-center text-blue-700">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Quality Guaranteed
              </div>
              <div className="flex items-center text-blue-700">
                <ClockIcon className="w-4 h-4 mr-2" />
                Fast Response Time
              </div>
              <div className="flex items-center text-blue-700">
                <CheckBadgeIcon className="w-4 h-4 mr-2" />
                Verified Seller
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Products Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
              Products ({filteredProducts.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <BuildingOfficeIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "This seller hasn't added any products yet"}
              </p>
            </div>
          )}
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Contact {seller.businessName}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {seller.phone && (
                  <a
                    href={`tel:${seller.phone}`}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <PhoneIcon className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Call</div>
                      <div className="text-sm text-gray-600">
                        {seller.phone}
                      </div>
                    </div>
                  </a>
                )}

                {seller.email && (
                  <a
                    href={`mailto:${seller.email}`}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <EnvelopeIcon className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-600">
                        {seller.email}
                      </div>
                    </div>
                  </a>
                )}

                {seller.website && (
                  <a
                    href={seller.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <GlobeAltIcon className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium">Website</div>
                      <div className="text-sm text-gray-600">
                        Visit our website
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
