import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import Footer from "../../components/Footer";
import SwipeHint from "../../components/SwipeHint";
import { useLogger } from "next-axiom";
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
  const [showTutorial, setShowTutorial] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 20000],
    rating: 0,
    seller: "",
    inStock: false,
    hasCustomization: false,
  });

  // SEO Dynamic Title and Description Generator
  const generateSEOContent = () => {
let title = "DesiGifting: India’s fastest‑growing personalized gifts";
let description =
  "Shop unique personalized gifts and custom products from verified creators. Fast shipping, secure payments, and 100% satisfaction guarantee on every order.";

    if (searchTerm) {
      title = `${searchTerm} - Custom Gifts | Desigifting`;
      description = `Find personalized ${searchTerm.toLowerCase()} gifts from talented sellers. Custom designs, fast delivery across India.`;
    } else if (filters.category) {
      title = `Custom ${filters.category} - Personalized Gifts | Desigifting | Gifting`;
      description = `Shop unique ${filters.category.toLowerCase()} gifts. Personalize with photos, text & custom designs. Made by talented artisans.`;
    }

    if (filteredProducts.length > 0) {
      title += ` (${filteredProducts.length}+ Products)`;
    }

    return { title, description };
  };

  const { title: seoTitle, description: seoDescription } = generateSEOContent();

  // Structured Data for Products Page
  const generateStructuredData = () => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: "Desigifting",
      url: "https://desigifting.store/products",
      description:
        "Browse thousands of personalized gifts and custom products from talented artisans worldwide",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Personalized Gifts Catalog",
        itemListElement: filteredProducts.slice(0, 8).map((product, index) => ({
          "@type": "Offer",
          position: index + 1,
          itemOffered: {
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images?.[0]?.url,
            sku: product.id,
            category: product.category,
            offers: {
              "@type": "Offer",
              price: product.hasOffer ? product.offerPrice : product.price,
              priceCurrency: "INR",
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
            aggregateRating: product.rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount || 1,
                }
              : null,
          },
        })),
      },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://desigifting.store",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://desigifting.store/products",
        },
      ],
    };

    return { organizationSchema, breadcrumbSchema };
  };

  const { organizationSchema, breadcrumbSchema } = generateStructuredData();

  useEffect(() => {
    fetchProducts();
  }, []);

   useEffect(() => {
     const seen = localStorage.getItem("seenSwipeTutorial");
     const isMobile = window.matchMedia("(max-width: 640px)").matches;
     if (!seen && isMobile) {
       setShowTutorial(true);
     }
   }, []);

   const closeTutorial = () => {
     localStorage.setItem("seenSwipeTutorial", "1");
     setShowTutorial(false);
   };

  useEffect(() => {
    filterAndSortProducts();
    setCurrentPage(1);
  }, [products, filters, searchTerm, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching All products from API...");
      const response = await fetch("/api/products?all=true");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched all products");
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

    // Enhanced search functionality
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
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

    // Price range filter
    filtered = filtered.filter((product) => {
      const effectivePrice = product.hasOffer
        ? product.offerPrice
        : product.price;
      const price = parseFloat(effectivePrice) || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(
        (product) => (product.rating || 0) >= filters.rating
      );
    }

    // Customization filter
    if (filters.hasCustomization) {
      filtered = filtered.filter(
        (product) =>
          product.customizationOptions &&
          Array.isArray(product.customizationOptions) &&
          product.customizationOptions.length > 0
      );
    }

    // Sorting logic
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
        filtered.sort((a, b) => {
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
      priceRange: [0, 20000],
      rating: 0,
      seller: "",
      inStock: false,
      hasCustomization: false,
    });
    setSearchTerm("");
    setSortBy("featured");
    setCurrentPage(1);
  };

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
      <>
        <Head>
          <title>Desigifting</title>
          <meta
            name="description"
            content="Loading personalized gifts and custom products"
          />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <div className="sticky top-0 z-50 bg-white">
            <Header />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="fixed inset-0 flex justify-center items-center bg-white/95 ">
              <svg
                width="160"
                height="110"
                viewBox="0 0 160 110"
                fill="none"
                className="loader-multigift"
                aria-label="loader showing animated moving gift boxes"
                role="img"
              >
                {/* Soft ground shadow */}
                <defs>
                  <filter
                    id="dropShadow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="4"
                      floodOpacity="0.3"
                    />
                  </filter>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Soft shadow ellipse */}
                <ellipse
                  cx="80"
                  cy="100"
                  rx="55"
                  ry="8"
                  fill="#000"
                  opacity="0.15"
                  className="loader-shadow"
                />

                {/* Main gift box - Blue */}
                <g className="gift-main" filter="url(#dropShadow)">
                  {/* Left face */}
                  <path
                    d="M 60 40 L 55 48 L 55 70 L 60 62 Z"
                    fill="#0a5fbf"
                    opacity="0.8"
                  />
                  {/* Front face */}
                  <rect
                    x="60"
                    y="40"
                    width="28"
                    height="26"
                    rx="4"
                    fill="url(#boxBlueGrad)"
                  />
                  {/* Top face */}
                  <path
                    d="M 60 40 L 55 35 L 83 35 L 88 40 Z"
                    fill="url(#boxBlueLight)"
                    opacity="0.9"
                  />
                  {/* Vertical ribbon */}
                  <rect
                    x="73"
                    y="40"
                    width="3"
                    height="26"
                    fill="url(#ribbonGoldGrad)"
                  />
                  {/* Horizontal ribbon */}
                  <rect
                    x="60"
                    y="51"
                    width="28"
                    height="3"
                    fill="url(#ribbonGoldGrad)"
                    opacity="0.95"
                  />
                  {/* Ribbon bow - left */}
                  <path
                    d="M 74 40 Q 70 25 65 40"
                    fill="url(#ribbonGoldGrad)"
                    opacity="0.9"
                    strokeWidth="1"
                    stroke="rgba(251, 191, 36, 0.5)"
                  />
                  {/* Ribbon bow - right */}
                  <path
                    d="M 74 40 Q 78 25 83 40"
                    fill="url(#ribbonGoldGrad)"
                    opacity="0.9"
                    strokeWidth="1"
                    stroke="rgba(251, 191, 36, 0.5)"
                  />
                  {/* Highlight on top */}
                  <ellipse
                    cx="70"
                    cy="37"
                    rx="8"
                    ry="4"
                    fill="white"
                    opacity="0.4"
                  />
                </g>

                {/* Side gift box 1 - Red */}
                <g className="gift-side gift1" filter="url(#dropShadow)">
                  {/* Left face */}
                  <path
                    d="M 23 62 L 20 67 L 20 82 L 23 77 Z"
                    fill="#991b1b"
                    opacity="0.75"
                  />
                  {/* Front face */}
                  <rect
                    x="23"
                    y="62"
                    width="18"
                    height="16"
                    rx="3"
                    fill="url(#boxRedGrad)"
                  />
                  {/* Top face */}
                  <path
                    d="M 23 62 L 20 58 L 38 58 L 41 62 Z"
                    fill="url(#boxRedLight)"
                    opacity="0.85"
                  />
                  {/* Vertical ribbon */}
                  <rect
                    x="31"
                    y="62"
                    width="2.5"
                    height="16"
                    fill="url(#ribbonWhiteGrad)"
                  />
                  {/* Horizontal ribbon */}
                  <rect
                    x="23"
                    y="69"
                    width="18"
                    height="2"
                    fill="url(#ribbonWhiteGrad)"
                    opacity="0.9"
                  />
                  {/* Ribbon bows */}
                  <path
                    d="M 32 62 Q 29 52 26 62"
                    fill="url(#ribbonWhiteGrad)"
                    opacity="0.85"
                  />
                  <path
                    d="M 32 62 Q 35 52 38 62"
                    fill="url(#ribbonWhiteGrad)"
                    opacity="0.85"
                  />
                  {/* Highlight */}
                  <ellipse
                    cx="27"
                    cy="59"
                    rx="5"
                    ry="2.5"
                    fill="white"
                    opacity="0.35"
                  />
                </g>

                {/* Side gift box 2 - Purple */}
                <g className="gift-side gift2" filter="url(#dropShadow)">
                  {/* Left face */}
                  <path
                    d="M 118 68 L 115 72 L 115 85 L 118 81 Z"
                    fill="#5e21a1"
                    opacity="0.75"
                  />
                  {/* Front face */}
                  <rect
                    x="118"
                    y="68"
                    width="16"
                    height="14"
                    rx="2.5"
                    fill="url(#boxPurpleGrad)"
                  />
                  {/* Top face */}
                  <path
                    d="M 118 68 L 115 65 L 131 65 L 134 68 Z"
                    fill="url(#boxPurpleLight)"
                    opacity="0.85"
                  />
                  {/* Vertical ribbon */}
                  <rect
                    x="125"
                    y="68"
                    width="2"
                    height="14"
                    fill="url(#ribbonPinkGrad)"
                  />
                  {/* Horizontal ribbon */}
                  <rect
                    x="118"
                    y="74"
                    width="16"
                    height="2"
                    fill="url(#ribbonPinkGrad)"
                    opacity="0.9"
                  />
                  {/* Ribbon bows */}
                  <path
                    d="M 126 68 Q 123 60 121 68"
                    fill="url(#ribbonPinkGrad)"
                    opacity="0.85"
                  />
                  <path
                    d="M 126 68 Q 129 60 132 68"
                    fill="url(#ribbonPinkGrad)"
                    opacity="0.85"
                  />
                  {/* Highlight */}
                  <ellipse
                    cx="122"
                    cy="65"
                    rx="4"
                    ry="2"
                    fill="white"
                    opacity="0.35"
                  />
                </g>

                {/* Enhanced sparkles */}
                {[
                  [50, 30],
                  [110, 28],
                  [80, 95],
                ].map(([cx, cy], i) => (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill={["#fbbf24", "#a3e635", "#ec4899"][i % 3]}
                      className="sparkle"
                      style={{ animationDelay: `${i * 0.8}s` }}
                      filter="url(#glow)"
                    />
                  </g>
                ))}

                <defs>
                  {/* Blue gradient */}
                  <linearGradient
                    id="boxBlueGrad"
                    x1="60"
                    y1="40"
                    x2="88"
                    y2="66"
                  >
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <linearGradient
                    id="boxBlueLight"
                    x1="60"
                    y1="35"
                    x2="88"
                    y2="42"
                  >
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>

                  {/* Red gradient */}
                  <linearGradient
                    id="boxRedGrad"
                    x1="23"
                    y1="62"
                    x2="41"
                    y2="78"
                  >
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  <linearGradient
                    id="boxRedLight"
                    x1="23"
                    y1="58"
                    x2="41"
                    y2="65"
                  >
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>

                  {/* Purple gradient */}
                  <linearGradient
                    id="boxPurpleGrad"
                    x1="118"
                    y1="68"
                    x2="134"
                    y2="82"
                  >
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                  <linearGradient
                    id="boxPurpleLight"
                    x1="118"
                    y1="65"
                    x2="134"
                    y2="72"
                  >
                    <stop offset="0%" stopColor="#d8b4fe" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>

                  {/* Ribbon gradients */}
                  <linearGradient
                    id="ribbonGoldGrad"
                    x1="73"
                    y1="40"
                    x2="73"
                    y2="66"
                  >
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient
                    id="ribbonWhiteGrad"
                    x1="31"
                    y1="62"
                    x2="31"
                    y2="78"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e5e7eb" />
                  </linearGradient>
                  <linearGradient
                    id="ribbonPinkGrad"
                    x1="125"
                    y1="68"
                    x2="125"
                    y2="82"
                  >
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              <style jsx>{`
                .loader-multigift {
                  animation: loader-rise 1.6s cubic-bezier(0.55, 0, 0.45, 1)
                    infinite;
                  will-change: transform;
                  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
                }

                .gift-main {
                  animation: mainGiftMove 2s ease-in-out infinite;
                }

                .gift-side.gift1 {
                  animation: sideGift1Move 2.2s ease-in-out infinite alternate;
                }

                .gift-side.gift2 {
                  animation: sideGift2Move 2.2s ease-in-out infinite alternate;
                  animation-delay: 1s;
                }

                .loader-shadow {
                  animation: shadowScale 1.6s ease-in-out infinite;
                }

                .sparkle {
                  opacity: 0;
                  animation: sparkleFade 3s linear infinite;
                }

                @keyframes loader-rise {
                  0%,
                  100% {
                    transform: translate3d(0, 0, 0);
                  }
                  50% {
                    transform: translate3d(0, -15px, 0);
                  }
                }

                @keyframes mainGiftMove {
                  0%,
                  100% {
                    transform: translateY(0) scale(1) rotateX(0deg);
                  }
                  50% {
                    transform: translateY(-16px) scale(1.04) rotateX(5deg);
                  }
                }

                @keyframes sideGift1Move {
                  0%,
                  100% {
                    transform: translateY(0) scale(1) rotateZ(-5deg);
                  }
                  50% {
                    transform: translateY(-10px) scale(1.03) rotateZ(0deg);
                  }
                }

                @keyframes sideGift2Move {
                  0%,
                  100% {
                    transform: translateY(0) scale(1) rotateZ(5deg);
                  }
                  50% {
                    transform: translateY(-12px) scale(1.04) rotateZ(0deg);
                  }
                }

                @keyframes shadowScale {
                  0%,
                  100% {
                    rx: 55;
                    ry: 8;
                    opacity: 0.15;
                  }
                  50% {
                    rx: 45;
                    ry: 6;
                    opacity: 0.08;
                  }
                }

                @keyframes sparkleFade {
                  0%,
                  70%,
                  100% {
                    opacity: 0;
                  }
                  10%,
                  30% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0.6;
                  }
                }
              `}</style>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        {/* Primary SEO Meta Tags */}
        <title>Desigifting</title>
        <meta name="title" content={`${seoTitle} - Desigifting`} />
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="gifting, custom gifts, personalized products, handmade, artisan crafts, photo gifts, engraved gifts, custom mugs, personalized jewelry, wedding gifts, home decor, India"
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`https://desigifting.store/products${
            searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""
          }`}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://desigifting.store/products" />
        <meta property="og:title" content={`${seoTitle} - Desigifting`} />
        <meta property="og:description" content={seoDescription} />
        <meta
          property="og:image"
          content="https://desigifting.store/products-og-image.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Desigifting" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://desigifting.store/products"
        />
        <meta property="twitter:title" content={`${seoTitle} - Desigifting`} />
        <meta property="twitter:description" content={seoDescription} />
        <meta
          property="twitter:image"
          content="https://desigifting.store/products-og-image.jpg"
        />

        {/* Additional Meta Tags */}
        <meta name="geo.region" content="IN" />
        <meta name="language" content="English" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="rating" content="General" />

        {/* Pagination Meta Tags */}
        {currentPage > 1 && <meta name="robots" content="index, follow" />}
        {totalPages > 1 && currentPage < totalPages && (
          <link
            rel="next"
            href={`https://desigifting.store/products?page=${currentPage + 1}`}
          />
        )}
        {currentPage > 1 && (
          <link
            rel="prev"
            href={`https://desigifting.store/products?page=${currentPage - 1}`}
          />
        )}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />

        {/* Search Action Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://desigifting.store",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://desigifting.store/products?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Breadcrumb Navigation */}

          {/* Hero Section */}
          <header className="relative text-center mb-10 sm:mb-14">
            {/* Decorative background gradient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
            >
              <div className="mx-auto h-40 sm:h-56 max-w-5xl blur-3xl opacity-30 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200" />
            </div>

            {/* Badge */}
            <div className="mb-5 sm:mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                <SparklesIcon className="h-4 w-4" />
                <span>Premium Personalized Gifts</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
              Create Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                Gifts
              </span>
            </h1>

            {/* Subcopy */}
            <p className="text-base font-bold sm:text-xl md:text-2xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
              {searchTerm
                ? `Showing ${filteredProducts.length} personalized results`
                : "India’s fastest-growing marketplace for handcrafted gifts."}
            </p>

            {/* CTAs */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push("/products")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all"
                aria-label="Browse all products"
              >
                <span>Start Shopping</span>
              </button>

              <button
                onClick={() => router.push("/seller/auth/register")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-700 bg-white px-6 sm:px-8 py-3 rounded-xl font-semibold text-base sm:text-lg hover:bg-emerald-50 active:scale-[0.98] transition-all"
                aria-label="Register as a seller"
              >
                <span>Start Selling</span>
              </button>
            </div>

            {/* Trust bar (optional, boosts credibility) */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-500">
              <div className="inline-flex items-center gap-2 justify-between">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
                  <path
                    fill="currentColor"
                    d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"
                  />
                </svg>
                <span>Trusted by 10k+ shoppers</span>
              </div>
              <div className="inline-flex items-center gap-2 justify-between">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
                  <path
                    fill="currentColor"
                    d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"
                  />
                </svg>
                <span>Completed over 18k orders successfully</span>
              </div>
              <div className="inline-flex items-center gap-2 justify-between">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
                  <path
                    fill="currentColor"
                    d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"
                  />
                </svg>
                <span>24/7 support for order tracking and delivery</span>
              </div>
            </div>
          </header>

          {/* Search & Filters Bar */}
          <section
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8"
            aria-labelledby="search-filters-heading"
          >
            <h2 id="search-filters-heading" className="sr-only">
              Search and Filter Products
            </h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="relative">
                <label htmlFor="product-search" className="sr-only">
                  Search for products
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="product-search"
                  type="text"
                  placeholder="Search for products, categories, or sellers..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="block w-full pl-10 sm:pl-12 pr-10 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all duration-200"
                  aria-describedby="search-help"
                />
                <div id="search-help" className="sr-only">
                  Search through our collection of personalized gifts and
                  products
                </div>
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                    aria-label="Clear search"
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
                aria-expanded={showFilters}
                aria-controls="advanced-filters"
              >
                <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div
                id="advanced-filters"
                className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        aria-label="Minimum price"
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
                              parseInt(e.target.value) || 20000,
                            ],
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                        aria-label="Maximum price"
                      />
                    </div>
                  </div>
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
          </section>

          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <label
                      htmlFor="sort-select"
                      className="text-sm font-medium text-gray-700"
                    >
                      Sort:
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="newest">Newest</option>
                      <option value="popular">Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="alphabetical">Name: A to Z</option>
                    </select>
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
                  </div>
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <section aria-labelledby="products-heading">
                    <h2 id="products-heading" className="sr-only">
                      Products ({filteredProducts.length} items)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                      {currentProducts.map((product, index) => (
                        <article
                          key={product.id}
                          className="group cursor-pointer"
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          <ProductCard
                            product={product}
                            viewMode="grid"
                            className="h-full hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 sm:transform sm:hover:-translate-y-1"
                            priority={index === 0}
                          />
                        </article>
                      ))}
                    </div>
                  </section>

                  {showTutorial && <SwipeHint onClose={closeTutorial} />}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav
                      aria-label="Products pagination"
                      className="mt-8 sm:mt-12 flex flex-col items-center gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg border transition-colors ${
                            currentPage === 1
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                          aria-label="Previous page"
                        >
                          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        {/* Page Numbers */}
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
                                  aria-label={`Go to page ${pageNum}`}
                                  aria-current={
                                    pageNum === currentPage ? "page" : undefined
                                  }
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
                          aria-label="Next page"
                        >
                          <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </p>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
