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
  const sliderRef = useRef(null);
  const touchStartX = useRef(null);
  const autoPlayRef = useRef(null);

  if (!product) return null;

  // ---------------------------------------
  // PREPARE IMAGES
  // ---------------------------------------
  const images =
    product.images?.filter((i) => i.url).length > 0
      ? product.images
      : [{ url: "/images/placeholder.jpg" }];

  // ---------------------------------------
  // PRICING HELPERS
  // ---------------------------------------
  const toNum = (val) => parseFloat(val) || 0;

  const getMinPrice = () => {
    if (product.pricingType === "set")
      return Math.min(...product.setPricing.map((p) => toNum(p.price)));
    if (product.pricingType === "variant")
      return Math.min(...product.variants.map((v) => toNum(v.price)));
    return toNum(product.price);
  };

  const getMaxPrice = () => {
    if (product.pricingType === "set")
      return Math.max(...product.setPricing.map((p) => toNum(p.price)));
    if (product.pricingType === "variant")
      return Math.max(...product.variants.map((v) => toNum(v.price)));
    return toNum(product.price);
  };

  const isSimple = product.pricingType === "simple";

  const now = new Date();
  const start = product.offerStartDate
    ? new Date(product.offerStartDate)
    : null;
  const end = product.offerEndDate ? new Date(product.offerEndDate) : null;
  const isOfferLive =
    isSimple &&
    product.hasOffer &&
    product.offerPercentage > 0 &&
    start <= now &&
    now <= end;

  const offerPrice = isOfferLive ? toNum(product.offerPrice) : null;
  const originalPrice = isOfferLive ? toNum(product.price) : null;

  const savings =
    isOfferLive && originalPrice && offerPrice
      ? Math.round(originalPrice - offerPrice)
      : null;

  const rangeText =
    product.pricingType !== "simple"
      ? getMinPrice() === getMaxPrice()
        ? `₹${getMinPrice()}`
        : `₹${getMinPrice()} - ₹${getMaxPrice()}`
      : null;

  // ---------------------------------------
  // AUTO PLAY SLIDER (ONLY IF MULTIPLE IMAGES)
  // ---------------------------------------
  useEffect(() => {
    if (images.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(autoPlayRef.current);
  }, [images.length]);

  // ---------------------------------------
  // SWIPE HANDLING
  // ---------------------------------------
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    clearInterval(autoPlayRef.current);
  };

  const onTouchEnd = (e) => {
    if (!touchStartX.current) return;

    const dx = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(dx) > 40) {
      if (dx > 0) {
        setIdx((prev) => (prev + 1) % images.length);
      } else {
        setIdx((prev) => (prev - 1 + images.length) % images.length);
      }
    }

    touchStartX.current = null;

    if (images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
      }, 3000);
    }
  };

  const goToProduct = () => router.push(`/products/${product.id}`);

  // ---------------------------------------
  // RENDER
  // ---------------------------------------
  return (
    <div
      className={`flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition shadow-sm overflow-hidden ${className}`}
    >
      {/* IMAGE SLIDER */}
      <div
        ref={sliderRef}
        className="relative w-full pb-[100%] bg-gray-100 cursor-pointer"
        onClick={goToProduct}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={images[idx].url}
          alt={product.name}
          fill
          loading="lazy" // default for non-priority
          decoding="async"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, (max-width:1280px) 25vw, 20vw"
        />

        {/* DOTS */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === idx ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* OFFER BADGE */}
        {isOfferLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
            {product.offerPercentage}% OFF
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-3 flex flex-col flex-1">
        <h3
          className="text-sm font-medium text-gray-800 line-clamp-2 cursor-pointer"
          onClick={goToProduct}
        >
          {product.name}
        </h3>

        <p className="text-[11px] text-gray-500 line-clamp-2 my-1">
          {product.description}
        </p>

        {product.businessName && (
          <p className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 w-max rounded-full">
            by {product.businessName}
          </p>
        )}

        {/* PRICES */}
        <div className="flex items-center space-x-2 mt-2">
          {isSimple ? (
            isOfferLive ? (
              <>
                <span className="text-lg font-bold text-emerald-600">
                  ₹{offerPrice}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">₹{product.price}</span>
            )
          ) : (
            <>
              <span className="text-[10px] text-gray-600">From</span>
              <span className="text-lg font-bold text-gray-900">
                {rangeText}
              </span>
            </>
          )}
        </div>

        {/* STOCK + SAVINGS */}
        <div className="mt-auto flex justify-between text-xs">
          <div className="flex items-center gap-1">
            {product.status === "active" && (
              <>
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  In Stock
                </span>
              </>
            )}
            {product.status === "fewleft" && (
              <>
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                  Few Left
                </span>
              </>
            )}
            {product.status === "inactive" && (
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Unavailable
              </span>
            )}
          </div>

          {savings && (
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              Save ₹{savings}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
