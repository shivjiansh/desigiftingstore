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

  // Existing offer logic...
  const now = new Date();
  const start = product.offerStartDate && new Date(product.offerStartDate);
  const end = product.offerEndDate && new Date(product.offerEndDate);
  const isOfferLive =
    product.hasOffer &&
    product.offerPercentage > 0 &&
    start <= now &&
    now <= end;

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
    // Pause auto-cycle while swiping
    clearInterval(intervalRef.current);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    
    const distance = Math.abs(touchStart - e.targetTouches[0].clientX);
    if (distance > 10) {
      setIsSwiping(true);
      e.preventDefault(); // Prevent scrolling
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (images.length > 1) {
      if (isLeftSwipe) {
        // Swipe left - next image
        setIdx((prev) => (prev + 1) % images.length);
      } else if (isRightSwipe) {
        // Swipe right - previous image
        setIdx((prev) => (prev - 1 + images.length) % images.length);
      }
    }

    // Reset swipe state and resume auto-cycle
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    
    // Resume auto-cycle
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setIdx((i) => (i + 1) % images.length);
      }, 4000);
    }
  };

  const openProduct = (e) => {
    // Don't navigate if user was swiping
    if (!isSwiping) {
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden ${className}`}
    >
      {/* Image with swipe support */}
      <div
        className="relative w-full pb-[100%] bg-gray-100 cursor-pointer touch-pan-y"
        onClick={openProduct}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <Image
          src={images[idx].url}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className={`transition-transform duration-200 ${isSwiping ? 'scale-105' : ''}`}
        />
        
        {/* Pagination dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === idx ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

     
        {/* Offer badge */}
        {isOfferLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
            {product.offerPercentage}% OFF
          </div>
        )}
      </div>

      {/* Rest of your existing component... */}
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

        <div className="flex items-center space-x-2 mb-3">
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
          {isOfferLive && (
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              You save ₹{Math.round(product.price - product.offerPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
