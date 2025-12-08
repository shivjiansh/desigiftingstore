import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import cloudinaryLoader from "../lib/cloudinaryLoader";

export default function ProductCard({ product, className = "" }) {
  const router = useRouter();
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [idx, setIdx] = useState(0);
  const sliderRef = useRef(null);
  const touchStartX = useRef(null);
  const autoPlayRef = useRef(null);

  if (!product) return null;

  // ---------------------------------------
  // PREPARE IMAGES
  // ---------------------------------------
  const images =
    product.images?.filter((i) => i.url).length > 0 ? product.images : [];

  const hasImages = images.length > 0;

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
  // INTERSECTION OBSERVER (Visibility Detection)
  // ---------------------------------------
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { root: null, rootMargin: "0px", threshold: [0, 0.5, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ---------------------------------------
  // AUTO PLAY SLIDER (Only when in view & multiple images)
  // ---------------------------------------
  useEffect(() => {
    if (!inView || images.length <= 1) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [inView, images.length]);

  // ---------------------------------------
  // SWIPE HANDLING
  // ---------------------------------------
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
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

    if (inView && images.length > 1 && !autoPlayRef.current) {
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
      ref={cardRef}
      className={`flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden ${className}`}
    >
      {/* IMAGE SLIDER OR PLACEHOLDER */}
      <div
        ref={sliderRef}
        className="relative w-full pb-[100%] bg-gray-100 cursor-pointer"
        onClick={goToProduct}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasImages && inView ? (
          <>
            {/* Actual Image when in view */}
            <Image
              loader={cloudinaryLoader}
              src={images[idx].url}
              alt={product.name}
              fill
              loading="lazy"
              decoding="async"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, (max-width:1280px) 25vw, 20vw"
              style={{ objectFit: "cover" }}
            />

            {/* DOTS */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
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
              <div className="absolute top-2 left-2 bg-red-600/80 text-white text-[10px] font-semibold px-2 py-1 rounded z-10">
                {product.offerPercentage}% OFF
              </div>
            )}
          </>
        ) : (
          // SVG LOADING ANIMATION (shown when not in view OR no images)
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid"
              width="80"
              height="80"
              style={{
                shapeRendering: "auto",
                display: "block",
                background: "transparent",
              }}
            >
              <g>
                <circle fill="#e15b64" r="10" cy="50" cx="84">
                  <animate
                    begin="0s"
                    keySplines="0 0.5 0.5 1"
                    values="10;0"
                    keyTimes="0;1"
                    calcMode="spline"
                    dur="0.4166666666666667s"
                    repeatCount="indefinite"
                    attributeName="r"
                  />
                  <animate
                    begin="0s"
                    values="#e15b64;#abbd81;#f8b26a;#f47e60;#e15b64"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="discrete"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="fill"
                  />
                </circle>
                <circle fill="#e15b64" r="10" cy="50" cx="16">
                  <animate
                    begin="0s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="0;0;10;10;10"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="r"
                  />
                  <animate
                    begin="0s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="16;16;16;50;84"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="cx"
                  />
                </circle>
                <circle fill="#f47e60" r="10" cy="50" cx="50">
                  <animate
                    begin="-0.4166666666666667s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="0;0;10;10;10"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="r"
                  />
                  <animate
                    begin="-0.4166666666666667s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="16;16;16;50;84"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="cx"
                  />
                </circle>
                <circle fill="#f8b26a" r="10" cy="50" cx="84">
                  <animate
                    begin="-0.8333333333333334s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="0;0;10;10;10"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="r"
                  />
                  <animate
                    begin="-0.8333333333333334s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="16;16;16;50;84"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="cx"
                  />
                </circle>
                <circle fill="#abbd81" r="10" cy="50" cx="16">
                  <animate
                    begin="-1.25s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="0;0;10;10;10"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="r"
                  />
                  <animate
                    begin="-1.25s"
                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                    values="16;16;16;50;84"
                    keyTimes="0;0.25;0.5;0.75;1"
                    calcMode="spline"
                    dur="1.6666666666666667s"
                    repeatCount="indefinite"
                    attributeName="cx"
                  />
                </circle>
              </g>
            </svg>
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
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  In Stock
                </span>
              </>
            )}
            {product.status === "fewleft" && (
              <>
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                <span className="text-[11px] text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                  Few Left
                </span>
              </>
            )}
            {product.status === "inactive" && (
              <span className="text-[11px] text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Unavailable
              </span>
            )}
          </div>

          {savings && (
            <span className=" text-[12px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              Save ₹{savings}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
