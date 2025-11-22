import { useState, useEffect, useRef } from "react";
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
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function SellersPage() {
  const router = useRouter();
   const [isExpanded, setIsExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const textRef = useRef(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [sellers, searchTerm]);

  useEffect(() => {
    const checkIfClamped = () => {
      if (textRef.current) {
        const element = textRef.current;
        // Check if content is overflowing
        setIsClamped(element.scrollHeight > element.clientHeight);
      }
    };

    checkIfClamped(); // Call the function
  }, []); // Add dependency array

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
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.businessInfo.businessName?.toLowerCase().includes(lower) ||
          s.businessInfo.description?.toLowerCase().includes(lower) ||
          s.name?.toLowerCase().includes(lower) ||
          s.categories?.some((c) => c.toLowerCase().includes(lower))
      );
    }
    setFilteredSellers(filtered);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-4 h-4 text-emerald-600" />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarIcon className="w-4 h-4 text-gray-300 absolute" />
            <div className="w-2 h-4 overflow-hidden">
              <StarIconSolid className="w-4 h-4 text-emerald-600" />
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
        <Footer />
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
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Sellers
            </h1>
            <p className="text-xl text-emerald-200 mb-8 max-w-2xl mx-auto">
              Connect with talented creators and artisans who craft unique,
              personalized gifts just for you
            </p>
            <div className="flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <CheckBadgeIcon className="w-5 h-5 mr-2 text-emerald-300" />
                    Verified Sellers
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 mr-2 text-yellow-300" />
                    Quality Products
                  </div>
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2 text-teal-300" />
                    Professional Service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white shadow-sm border-b  top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sellers, businesses, or categories..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
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
                <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-teal-600">
                  {seller.banner ? (
                    <Image
                      src={seller.banner}
                      alt={`${seller.businessName} banner`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600" />
                  )}
                  {seller.isVerified && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                        <CheckBadgeIcon className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Section */}
                <div className="relative px-6 pb-6">
                  <div className="absolute -top-8 left-6">
                    <div className="w-16 h-16 bg-white rounded-full border-4 border-white overflow-hidden shadow-lg">
                      {seller.logo ? (
                        <Image
                          src={seller.logo}
                          alt={`${seller.businessName} logo`}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {seller.businessInfo.businessName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(seller.sellerStats?.ratings?.average || 3)}
                        <span className="text-sm text-gray-600 ml-1">
                          ({seller.sellerStats?.ratings?.total || 0})
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      Artist: {seller.name}
                    </p>

                    {seller.businessInfo?.address?.state ||
                      ("dsg" && (
                        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>
                            {seller.businessInfo?.address?.city || "gzb"},
                          </span>
                          <span>
                            {seller.businessInfo?.address?.state || "gzb"}
                          </span>
                        </div>
                      ))}

                    <div className="description-section">
                      <p
                        ref={textRef}
                        className={`text-gray-700 text-sm mb-2 transition-all duration-300 ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {seller.description}
                      </p>

                      {/* {isClamped && (
                        <button
                          onClick={toggleExpanded}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold underline decoration-dotted underline-offset-2 hover:no-underline transition-all duration-200"
                        >
                          {isExpanded ? "← Read Less" : "Read More →"}
                        </button>
                      )} */}
                    </div>

                    {/* Stats */}
                    {/* <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {seller.productCount || 0}
                        </div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {seller.sellerStats?.totalSales || 0}
                        </div>
                        <div className="text-xs text-gray-500">Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {seller.yearsActive || 0}
                        </div>
                        <div className="text-xs text-gray-500">Years</div>
                      </div>
                    </div> */}

                    {/* Categories */}

                    {/* Contact Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      {seller.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="w-3 h-3 mr-1 text-emerald-600" />
                          Contact Available
                        </div>
                      )}
                      {seller.website && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="w-3 h-3 mr-1 text-teal-600" />
                          Website
                        </div>
                      )}
                    </div>

                    {/* Visit Store Button */}
                    <Link href={`/store/${seller.id}`}>
                      <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg">
                        <EyeIcon className="w-4 h-4" />
                        <span>Visit Store</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
              <button
                onClick={() => setSearchTerm("")}
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
