import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  EyeIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function SellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [sellers, searchTerm]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seller/info");
      const result = await response.json();
      if (result.success) {
        setSellers(result.data.sellers || []);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSellers = () => {
    let filtered = sellers;

    // Search filter only
    if (searchTerm) {
      filtered = filtered.filter(
        (seller) =>
          seller.businessName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          seller.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.categories?.some((category) =>
            category.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredSellers(filtered);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarIcon className="w-4 h-4 text-gray-300 absolute" />
            <div className="w-2 h-4 overflow-hidden">
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Browse Sellers - Desi Gifting</title>
        <meta
          name="description"
          content="Discover talented sellers and their unique custom products"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Sellers
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Connect with talented creators and artisans who craft unique,
              personalized gifts just for you
            </p>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <CheckBadgeIcon className="w-5 h-5 mr-2 text-green-300" />
                    Verified Sellers
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 mr-2 text-yellow-300" />
                    Quality Products
                  </div>
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-300" />
                    Professional Service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white shadow-sm border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sellers, businesses, or categories..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-600 text-center">
                  {filteredSellers.length} seller
                  {filteredSellers.length !== 1 ? "s" : ""} found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Stats */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {searchTerm ? (
                <>
                  Showing{" "}
                  <span className="font-semibold">
                    {filteredSellers.length}
                  </span>{" "}
                  results for "{searchTerm}"
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold">
                    {filteredSellers.length}
                  </span>{" "}
                  sellers
                </>
              )}
            </p>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
              >
                {/* Banner Image */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  {seller.bannerImage ? (
                    <Image
                      src={seller.bannerImage}
                      alt={`${seller.businessName} banner`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
                  )}

                  {/* Verified Badge */}
                  {seller.isVerified && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                        <CheckBadgeIcon className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Section */}
                <div className="relative px-6 pb-6">
                  {/* Logo */}
                  <div className="absolute -top-8 left-6">
                    <div className="w-16 h-16 bg-white rounded-full border-4 border-white overflow-hidden shadow-lg">
                      {seller.logo ? (
                        <Image
                          src={seller.logo}
                          alt={`${seller.businessName} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {seller.businessName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(seller.rating || 0)}
                        <span className="text-sm text-gray-600 ml-1">
                          ({seller.reviewCount || 0})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">{seller.name}</p>

                    {seller.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {seller.location}
                      </div>
                    )}

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {seller.description ||
                        "Creating unique custom gifts with love and attention to detail."}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {seller.productCount || 0}
                        </div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {seller.totalSales || 0}
                        </div>
                        <div className="text-xs text-gray-500">Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {seller.yearsActive || 0}
                        </div>
                        <div className="text-xs text-gray-500">Years</div>
                      </div>
                    </div>

                    {/* Categories */}
                    {seller.categories && seller.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {seller.categories
                          .slice(0, 3)
                          .map((category, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {category}
                            </span>
                          ))}
                        {seller.categories.length > 3 && (
                          <span className="text-gray-500 text-xs px-2 py-1">
                            +{seller.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      {seller.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="w-3 h-3 mr-1" />
                          Contact Available
                        </div>
                      )}
                      {seller.website && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="w-3 h-3 mr-1" />
                          Website
                        </div>
                      )}
                    </div>

                    {/* Visit Store Button */}
                    <Link href={`/store/${seller.id}`}>
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg">
                        <EyeIcon className="w-4 h-4" />
                        <span>Visit Store</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSellers.length === 0 && !loading && (
            <div className="text-center py-16">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No sellers found" : "No sellers available"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? `No sellers match "${searchTerm}". Try a different search term.`
                  : "No sellers are currently available."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
