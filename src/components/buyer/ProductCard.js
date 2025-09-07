import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { formatPrice } from "../../utils/formatters";
import { HeartIcon, StarIcon, EyeIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

const ProductCard = ({
  product,
  onAddToWishlist,
  isInWishlist = false,
  className = "",
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const router = useRouter();

  // Touch/swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const imageRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);

    // Prevent default scrolling when swiping horizontally
    const currentTouch = e.targetTouches[0].clientX;
    const distance = Math.abs(touchStart - currentTouch);

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

    if (product.images && product.images.length > 1) {
      if (isLeftSwipe) {
        // Swipe left - next image
        setImageIndex((prev) => (prev + 1) % product.images.length);
      } else if (isRightSwipe) {
        // Swipe right - previous image
        setImageIndex(
          (prev) => (prev - 1 + product.images.length) % product.images.length
        );
      }
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };

  const handleImageCycle = (e) => {
    e.stopPropagation();
    // Only allow click cycling if not swiping
    if (!isSwiping && product.images && product.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handleProductClick = (e) => {
    // Prevent navigation if user was swiping
    if (!isSwiping) {
      router.push(`/products/${product.id}`);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const renderStars = (rating, reviewCount) => {
    if (!rating || !reviewCount) return null;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon
          key="half"
          className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <div className="flex">{stars}</div>
        <span className="text-xs text-gray-600">({reviewCount})</span>
      </div>
    );
  };

  return (
    <div
      className={`card card-hover cursor-pointer group ${className}`}
      onClick={handleProductClick}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        {/* Product Image */}
        <img
          ref={imageRef}
          src={product.images?.[imageIndex] || "/images/default-product.jpg"}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isImageLoading ? "opacity-0" : "opacity-100"
          } ${isSwiping ? "transition-none" : ""}`}
          loading="lazy"
          onLoad={() => setIsImageLoading(false)}
          onClick={handleImageCycle}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y pinch-zoom" }}
        />

        {/* Loading Skeleton */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
          </div>
        )}

        {/* Image Indicators */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {imageIndex + 1} / {product.images.length}
          </div>
        )}

        {/* Swipe Indicator for Mobile */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-2 md:hidden">
            <div className="flex space-x-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === imageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Swipe Hint */}
        {product.images && product.images.length > 1 && imageIndex === 0 && (
          <div className="absolute inset-0 md:hidden pointer-events-none">
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 text-xs animate-pulse">
              <div className="flex items-center space-x-1">
                <span>Swipe</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? (
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isSwiping) {
              router.push(`/products/${product.id}`);
            }
          }}
          className="absolute top-2 left-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Quick view"
        >
          <EyeIcon className="h-4 w-4 text-gray-600" />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Seller Badge */}
        {product.sellerName && (
          <div className="mb-2">
            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              by {product.sellerName}
            </span>
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag text-xs">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="tag text-xs bg-gray-100 text-gray-600">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {product.rating && product.reviewCount && (
          <div className="mb-3">
            {renderStars(product.rating, product.reviewCount)}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-end">
          {/* Price */}
          <div>
            <div className="price text-lg">{formatPrice(product.price)}</div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Sales Count */}
          {product.totalSales && product.totalSales > 0 && (
            <div className="text-xs text-gray-500">
              {product.totalSales} sold
            </div>
          )}
        </div>

        {/* Customization Available Badge */}
        {product.customizationOptions &&
          product.customizationOptions.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-accent-600 bg-accent-50 px-2 py-1 rounded-full">
                ✨ Customizable
              </span>
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductCard;
