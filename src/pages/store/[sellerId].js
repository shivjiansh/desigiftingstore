import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { toast } from "react-hot-toast";
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
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";

export default function SellerStorePage() {
  const router = useRouter();
  const { sellerId } = router.query;

  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showContactModal, setShowContactModal] = useState(false);

  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
      fetchReviews();
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId && user) {
      checkUserRating();
    }
  }, [sellerId, user]);

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

  const fetchReviews = async (page = 1) => {
    if (!sellerId) return;

    setReviewsLoading(true);
    try {
      const response = await fetch(
        `/api/ratings/reviews?sellerId=${sellerId}&page=${page}&limit=10`
      );
      const result = await response.json();

      if (result.success) {
        if (page === 1) {
          setReviews(result.data.reviews);
        } else {
          setReviews((prev) => [...prev, ...result.data.reviews]);
        }
        setHasMoreReviews(result.data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadMoreReviews = () => {
    if (!reviewsLoading && hasMoreReviews) {
      const nextPage = reviewsPage + 1;
      setReviewsPage(nextPage);
      fetchReviews(nextPage);
    }
  };

  const checkUserRating = async () => {
    if (!user || !sellerId) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/ratings?sellerId=${sellerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data.hasRated) {
        setHasRated(true);
        setUserRating(result.data.rating);
        setRatingComment(result.data.comment || "");
      }
    } catch (error) {
      console.error("Error checking user rating:", error);
    }
  };

  const submitRating = async () => {
    if (!user) {
      toast.error("Please login to rate this seller");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (user.uid === sellerId) {
      toast.error("You cannot rate your own store");
      return;
    }

    setSubmittingRating(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId,
          rating: userRating,
          comment: ratingComment.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          hasRated
            ? "Rating updated successfully!"
            : "Rating submitted successfully!"
        );
        setHasRated(true);
        setShowRatingModal(false);

        // Refresh seller data and reviews
        fetchSellerData();
        fetchReviews(1);
        setReviewsPage(1);
      } else {
        toast.error(result.error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setSubmittingRating(false);
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

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      const isFilled = i < fullStars;
      const StarComponent = isFilled ? StarIconSolid : StarIcon;

      stars.push(
        <StarComponent
          key={i}
          className={`w-5 h-5 ${
            interactive
              ? `cursor-pointer transition-colors ${
                  i < (hoverRating || userRating)
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-yellow-300"
                }`
              : isFilled
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
          onClick={interactive ? () => setUserRating(i + 1) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    }
    return stars;
  };

  const renderSmallStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      const isFilled = i < fullStars;
      const StarComponent = isFilled ? StarIconSolid : StarIcon;

      stars.push(
        <StarComponent
          key={i}
          className={`w-4 h-4 ${
            isFilled ? "text-yellow-400" : "text-gray-300"
          }`}
        />
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
      toast.success("Store link copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <meta name="description" content={seller.businessInfo?.description} />
        <meta
          property="og:title"
          content={`${seller.businessName} - Custom Gifts Store`}
        />
        <meta
          property="og:description"
          content={seller.businessInfo?.description}
        />
        <meta property="og:image" content={seller.banner || seller.logo} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Store Header */}
        <div className="relative">
          {/* Banner */}
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            {seller.banner ? (
              <Image
                src={seller.banner}
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
                        alt={`${seller.businessInfo.businessName} logo`}
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

                  {seller.businessInfo?.badge?.isVerified && (
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
                        {seller.businessInfo?.businessName}
                      </h1>
                      <p className="text-lg text-gray-600 mb-2">
                        {seller.name}
                      </p>

                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                          {renderStars(
                            seller.sellerStats?.ratings?.average || 0
                          )}
                          <span className="ml-2 text-gray-600">
                            ({seller.sellerStats?.ratings?.total || 0} reviews)
                          </span>
                          
                        </div>

                        {seller.businessInfo?.address && (
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {seller.businessInfo?.address?.city || "gzb"},{" "}
                            {seller.businessInfo?.address?.state || "U.P"}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 max-w-2xl">
                        {seller.businessInfo?.description || "THIS WILL BE DESCRIPTION"}
                      </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex space-x-3">
                      {user && user.uid !== sellerId && (
                        <button
                          onClick={() => setShowRatingModal(true)}
                          className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          {hasRated ? "Update Rating" : "Rate Seller"}
                        </button>
                      )}

                      <button
                        onClick={() => setShowContactModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        <PhoneIcon className="w-5 h-5 inline mr-2" />
                        Contact
                      </button>
                      <a
                        href={`https://wa.me/${seller.phone?.replace(
                          /\D/g,
                          ""
                        )}?text=Hi, I'm interested in your products on Desi Gifting`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                        WhatsApp
                      </a>
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
                  {seller.sellerStats?.totalSales || 0}
                </div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Date().getFullYear() -
                    new Date(seller.createdAt).getFullYear() || 0}
                </div>
                <div className="text-sm text-gray-600">Years Active</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((seller.sellerStats?.ratings?.average || 0) * 20)}
                  %
                </div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Features */}

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Products Section */}
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
        {/* add divider */}

        {/* Reviews Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="ml-6 text-2xl font-bold text-gray-900">
              Customer Reviews ({seller.sellerStats?.ratings?.total || 0})
            </h2>
            {!showAllReviews && reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Reviews
              </button>
            )}
          </div>

          {/* Rating Breakdown */}
          {seller.sellerStats?.ratings &&
            seller.sellerStats.ratings.total > 0 && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Overall Rating */}
                  <div className="text-center md:text-left">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {seller.sellerStats.ratings.average.toFixed(1)}
                    </div>
                    <div className="flex justify-center md:justify-start items-center mb-2">
                      {renderStars(seller.sellerStats.ratings.average)}
                    </div>
                    <div className="text-gray-600">
                      Based on {seller.sellerStats.ratings.total} reviews
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="mt-6 grid gap-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        seller.sellerStats.ratings.breakdown[star] || 0;
                      const pct = seller.sellerStats.ratings.total
                        ? (count / seller.sellerStats.ratings.total) * 100
                        : 0;
                      return (
                        <div key={star} className="flex items-center">
                          {/* Star label */}
                          <div className="flex items-center w-12 text-sm font-semibold text-gray-700">
                            <span>{star}</span>
                            <StarIconSolid className="w-4 h-4 text-yellow-500 ml-1" />
                          </div>
                          {/* Progress bar */}
                          <div className="flex-1 relative h-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden mx-4">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-width duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {/* Count */}
                          <div className="w-8 text-right text-sm text-gray-600 font-medium">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          {/* Reviews List */}
          <div className="space-y-2">
            {reviews.length > 0 ? (
              <>
                {(showAllReviews ? reviews : reviews.slice(0, 3)).map(
                  (review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-3xl p-6 shadow hover:shadow-lg transition-shadow border border-gray-200 max-w-xl mx-auto"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                          {review.userName?.[0].toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-800">
                                {review.userName || "Anonymous"}
                              </span>
                              <div className="flex">
                                {renderSmallStars(review.rating)}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {showAllReviews && hasMoreReviews && (
                  <div className="text-center">
                    <button
                      onClick={loadMoreReviews}
                      disabled={reviewsLoading}
                      className="inline-flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                    >
                      {reviewsLoading ? "Loading…" : "Load More Reviews"}
                    </button>
                  </div>
                )}

                {!showAllReviews && reviews.length > 3 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="text-indigo-600 hover:underline"
                    >
                      View All Reviews
                    </button>
                  </div>
                )}

                {showAllReviews && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllReviews(false)}
                      className="text-indigo-600 hover:underline"
                    >
                      Show Less
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center shadow border border-gray-200">
                <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600">
                  Be the first to review this seller!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {hasRated ? "Update Your Rating" : "Rate This Seller"}
                </h3>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderStars(userRating, true)}
                    <span className="ml-2 text-sm text-gray-600">
                      {userRating > 0 ? `${userRating}/5` : "Select rating"}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Share your experience with this seller..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {ratingComment.length}/500
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRating}
                    disabled={submittingRating || userRating === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingRating
                      ? "Submitting..."
                      : hasRated
                      ? "Update Rating"
                      : "Submit Rating"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Contact {seller.businessInfo?.businessName}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
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

                {seller.socialLinks?.website && (
                  <a
                    href={seller.socialLinks.website}
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
