import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

export default function ProductCard({ product, className = "" }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef(null);

  // Swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  if (!product) return null;

  // ============================================
  // ✅ HELPERS: Support all 3 pricing types
  // ============================================

  // Get minimum price (for all pricing types)
  const getMinPrice = () => {
    if (product.pricingType === "set" && product.setPricing?.length > 0) {
      // For set pricing, get minimum from all sets
      const prices = product.setPricing.map((s) => parseFloat(s.price) || 0);
      return Math.min(...prices);
    } else if (
      product.pricingType === "variant" &&
      product.variants?.length > 0
    ) {
      // For variant pricing, get minimum from all variants
      const prices = product.variants.map((v) => parseFloat(v.price) || 0);
      return Math.min(...prices);
    } else {
      // For simple pricing
      return parseFloat(product.price) || 0;
    }
  };

  // Get maximum price (for display range)
  const getMaxPrice = () => {
    if (product.pricingType === "set" && product.setPricing?.length > 0) {
      const prices = product.setPricing.map((s) => parseFloat(s.price) || 0);
      return Math.max(...prices);
    } else if (
      product.pricingType === "variant" &&
      product.variants?.length > 0
    ) {
      const prices = product.variants.map((v) => parseFloat(v.price) || 0);
      return Math.max(...prices);
    } else {
      return parseFloat(product.price) || 0;
    }
  };

  // Get display price (for main price tag)
  const getDisplayPrice = () => {
    return getMinPrice();
  };

  // Get original price (for line-through on simple pricing with offer)
  const getOriginalPrice = () => {
    if (product.pricingType === "set" || product.pricingType === "variant") {
      return null; // No line-through for set/variant pricing
    }

    // For simple pricing with offer
    const now = new Date();
    const start = product.offerStartDate && new Date(product.offerStartDate);
    const end = product.offerEndDate && new Date(product.offerEndDate);
    const isOfferLive =
      product.hasOffer &&
      product.offerPercentage > 0 &&
      start <= now &&
      now <= end;

    if (isOfferLive) {
      return parseFloat(product.price) || 0;
    }
    return null;
  };

  // Get offer price (for discounted price display)
  const getOfferPrice = () => {
    if (product.pricingType !== "simple" || !product.hasOffer) {
      return null;
    }

    const now = new Date();
    const start = product.offerStartDate && new Date(product.offerStartDate);
    const end = product.offerEndDate && new Date(product.offerEndDate);
    const isOfferLive =
      product.offerPercentage > 0 && start <= now && now <= end;

    return isOfferLive ? parseFloat(product.offerPrice) || 0 : null;
  };

  // Check if offer is live (only for simple pricing)
  const now = new Date();
  const start = product.offerStartDate && new Date(product.offerStartDate);
  const end = product.offerEndDate && new Date(product.offerEndDate);
  const isOfferLive =
    product.pricingType === "simple" &&
    product.hasOffer &&
    product.offerPercentage > 0 &&
    start <= now &&
    now <= end;

  // Get pricing badge text
  const getPricingBadgeText = () => {
    if (product.pricingType === "set") {
      return `${product.setPricing?.length || 0} bundles`;
    } else if (product.pricingType === "variant") {
      return `${product.variants?.length || 0} options`;
    }
    return null;
  };

  // Get price range text
  const getPriceRangeText = () => {
    const minPrice = getMinPrice();
    const maxPrice = getMaxPrice();

    if (product.pricingType === "set" || product.pricingType === "variant") {
      if (minPrice === maxPrice) {
        return `₹${minPrice}`;
      }
      return `₹${minPrice} - ₹${maxPrice}`;
    }
    return null;
  };

  // Prepare images
  const images =
    product.images?.filter((i) => i.url).length > 0
      ? product.images.filter((i) => i.url)
      : [{ url: "/images/placeholder.jpg" }];

  // Auto-cycle effect
  useEffect(() => {
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setIdx((i) => (i + 1) % images.length);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
    clearInterval(intervalRef.current);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);

    const distance = Math.abs(touchStart - e.targetTouches[0].clientX);
    if (distance > 10) {
      setIsSwiping(true);
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (images.length > 1) {
      if (isLeftSwipe) {
        setIdx((prev) => (prev + 1) % images.length);
      } else if (isRightSwipe) {
        setIdx((prev) => (prev - 1 + images.length) % images.length);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);

    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setIdx((i) => (i + 1) % images.length);
      }, 4000);
    }
  };

  const openProduct = (e) => {
    if (!isSwiping) {
      router.push("/products/" + product.id);
    }
  };

  // Calculate savings for simple pricing
  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalPrice();
  const offerPrice = getOfferPrice();
  const savings = isOfferLive
    ? Math.round(
        (parseFloat(product.price) || 0) - (parseFloat(product.offerPrice) || 0)
      )
    : 0;

  return (
    <div
      className={
        "flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden " +
        className
      }
    >
      {/* Image with swipe support */}
      <div
        className="relative w-full pb-[100%] bg-gray-100 cursor-pointer touch-pan-y"
        onClick={openProduct}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        <Image
          src={images[idx].url}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className={
            "transition-transform duration-200 " +
            (isSwiping ? "scale-105" : "")
          }
        />

        {/* Pagination dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={
                  "w-2 h-2 rounded-full transition-colors " +
                  (i === idx ? "bg-white" : "bg-white/50")
                }
              />
            ))}
          </div>
        )}

        {/* ✅ Offer badge - Only for SIMPLE pricing with active offer */}
        {isOfferLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
            {product.offerPercentage}% OFF
          </div>
        )}

        {/* ✅ Pricing type badge */}
        

        
      </div>

      {/* Rest of component */}
      <div className="p-3 flex flex-col flex-1">
        <h3
          className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 cursor-pointer"
          onClick={openProduct}
        >
          {product.name}
        </h3>

        <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
          {product.description}
        </p>

        {(product.businessName || product.sellerBusinessName) && (
          <div className="flex items-center mb-3">
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
              by {product.businessName || product.sellerBusinessName}
            </span>
          </div>
        )}

        {/* ✅ PRICE DISPLAY: 
          - SIMPLE: Show regular price (no "From")
          - BUNDLE/VARIANT: Show "From" + min price
        */}
        <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
          {product.pricingType === "simple" ? (
            // ✅ SIMPLE PRICING - Show original price (no "From")
            <>
              {isOfferLive ? (
                <>
                  <span className="text-lg font-bold text-emerald-600 leading-none">
                    ₹{product.offerPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through leading-none">
                    ₹{product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  ₹{product.price}
                </span>
              )}
            </>
          ) : product.pricingType === "set" ? (
            // ✅ SET PRICING (Bundles) - Show "From"
            <>
              <span className="text-[10px] text-gray-600">From</span>
              <span className="text-lg font-bold text-gray-900 leading-none">
                {getPriceRangeText()}
              </span>
            </>
          ) : product.pricingType === "variant" ? (
            // ✅ VARIANT PRICING (Size, Color) - Show "From"
            <>
              <span className="text-[10px] text-gray-600">From</span>
              <span className="text-lg font-bold text-gray-900 leading-none">
                {getPriceRangeText()}
              </span>
            </>
          ) : (
            // ✅ FALLBACK (if no pricingType) - Show simple price
            <span className="text-lg font-bold text-gray-900 leading-none">
              ₹{displayPrice}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            {product.status === "active" && (
              <>
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                  In Stock
                </span>
              </>
            )}
            {product.status === "fewleft" && (
              <>
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full">
                  Few Left
                </span>
              </>
            )}
            {product.status === "inactive" && (
              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full">
                Unavailable
              </span>
            )}
            {product.status === "draft" && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full">
                Draft
              </span>
            )}
          </div>
          {isOfferLive && savings > 0 && (
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              Save ₹{savings}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
