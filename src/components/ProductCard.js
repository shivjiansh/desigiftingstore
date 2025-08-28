// import { useState } from 'react';
// import Link from 'next/link';

// export default function ProductCard({ product, onClick }) {
//   const [imageError, setImageError] = useState(false);

//   const handleImageError = () => {
//     setImageError(true);
//   };

//   const generateStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 !== 0;

//     for (let i = 0; i < fullStars; i++) {
//       stars.push('⭐');
//     }
//     if (hasHalfStar) {
//       stars.push('⭐');
//     }
//     return stars.join('');
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
//       {/* Product Image */}
//       <div className="aspect-square bg-gray-100 relative">
//         {!imageError ? (
//           <img
//             src={product.images?.[0] || '/images/placeholder.jpg'}
//             alt={product.name}
//             className="w-full h-full object-cover"
//             onError={handleImageError}
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-gray-400">
//             <span className="text-4xl">🎁</span>
//           </div>
//         )}

//         {/* Quick actions overlay */}
//         <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
//           <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50">
//             ❤️
//           </button>
//         </div>
//       </div>

//       {/* Product Info */}
//       <div className="p-4">
//         <div className="mb-2">
//           <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
//           <p className="text-sm text-gray-600">{product.sellerName}</p>
//         </div>

//         {/* Rating */}
//         <div className="flex items-center mb-2">
//           <span className="text-yellow-400 text-sm">{generateStars(product.rating)}</span>
//           <span className="text-sm text-gray-600 ml-1">
//             {product.rating} ({product.reviewCount})
//           </span>
//         </div>

//         {/* Price */}
//         <div className="flex items-center justify-between mb-3">
//           <span className="text-lg font-bold text-gray-900">
//             ${product.basePrice.toFixed(2)}
//           </span>
//           <span className="text-sm text-gray-600">+ customization</span>
//         </div>

//         {/* Customization options */}
//         <div className="mb-3">
//           <div className="flex flex-wrap gap-1">
//             {product.customizations?.slice(0, 3).map((option) => (
//               <span
//                 key={option}
//                 className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
//               >
//                 {option}
//               </span>
//             ))}
//             {product.customizations?.length > 3 && (
//               <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
//                 +{product.customizations.length - 3} more
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Action buttons */}
//         <div className="flex gap-2">
//           <button
//             onClick={onClick}
//             className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
//           >
//             Customize
//           </button>
//           <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
//             👁️
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// // components/ProductCard.js
// import Image from 'next/image';

// export default function ProductCard({ product, viewMode = 'grid', className = '' }) {
//   if (viewMode === 'list') {
//     return (
//       <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-3 ${className}`}>
//         <div className="flex gap-3">
//           <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
//             <Image
//               src={product.image || '/images/placeholder.jpg'}
//               alt={product.name}
//               width={64}
//               height={64}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <div className="flex-1 min-w-0">
//             <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{product.name}</h3>
//             <p className="text-xs text-gray-600 line-clamp-2 mb-2">{product.description}</p>
//             <div className="flex items-center justify-between">
//               <div>
//                 <span className="text-sm font-semibold text-gray-900">${product.basePrice}</span>
//                 {product.rating && (
//                   <div className="flex items-center gap-1 mt-1">
//                     <span className="text-xs text-yellow-500">★</span>
//                     <span className="text-xs text-gray-600">{product.rating}</span>
//                     <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
//                   </div>
//                 )}
//               </div>
//               <div className="text-right">
//                 <p className="text-xs text-gray-500">{product.sellerName}</p>
//                 {product.isCustomizable && (
//                   <span className="inline-block bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full mt-1">
//                     Customizable
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden ${className}`}>
//       <div className="aspect-square bg-gray-100 overflow-hidden">
//         <Image
//           src={product.image || '/images/placeholder.jpg'}
//           alt={product.name}
//           width={300}
//           height={300}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//         />
//       </div>
//       <div className="p-3">
//         <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
//         <p className="text-xs text-gray-600 line-clamp-2 mb-2">{product.description}</p>
        
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-semibold text-gray-900">${product.basePrice}</span>
//           {product.rating && (
//             <div className="flex items-center gap-1">
//               <span className="text-xs text-yellow-500">★</span>
//               <span className="text-xs text-gray-600">{product.rating}</span>
//               <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center justify-between">
//           <p className="text-xs text-gray-500 truncate">{product.sellerName}</p>
//           {product.isCustomizable && (
//             <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
//               Custom
//             </span>
//           )}
//         </div>

//         {!product.inStock && (
//           <div className="mt-2">
//             <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
//               Out of Stock
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/router";
// import Image from "next/image";

// export default function ProductCard({
//   product,
//   viewMode = "grid",
//   className = "",
// }) {
//   const router = useRouter();
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [touchStart, setTouchStart] = useState(null);
//   const [touchEnd, setTouchEnd] = useState(null);
//   const carouselRef = useRef(null);
//   const autoSlideRef = useRef(null);

//   if (!product) return null;

//   // ✅ FIXED: Correct image array logic
//   const images =
//     Array.isArray(product.images) && product.images.length > 0
//       ? product.images.filter((img) => img?.url) // Filter out images without URLs
//       : [{ url: "/images/placeholder.jpg" }];

//   const hasMultipleImages = images.length > 1;

//   // Auto slide
//   useEffect(() => {
//     if (hasMultipleImages) {
//       autoSlideRef.current = setInterval(() => {
//         setCurrentImageIndex((prev) => (prev + 1) % images.length);
//       }, 4000);
//     }
//     return () => clearInterval(autoSlideRef.current);
//   }, [hasMultipleImages, images.length]);

//   // Touch swipe handlers
//   const onTouchStart = (e) => {
//     if (!hasMultipleImages) return;
//     e.stopPropagation();
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     clearInterval(autoSlideRef.current);
//   };

//   const onTouchMove = (e) => {
//     if (!hasMultipleImages) return;
//     e.stopPropagation();
//     setTouchEnd(e.targetTouches[0].clientX);
//   };

//   const onTouchEnd = (e) => {
//     if (!hasMultipleImages) return;
//     e.stopPropagation();
//     if (!touchStart || !touchEnd) return;
//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > 50;
//     const isRightSwipe = distance < -50;
//     if (isLeftSwipe)
//       setCurrentImageIndex((currentImageIndex + 1) % images.length);
//     if (isRightSwipe)
//       setCurrentImageIndex(
//         (currentImageIndex - 1 + images.length) % images.length
//       );

//     autoSlideRef.current = setInterval(() => {
//       setCurrentImageIndex((prev) => (prev + 1) % images.length);
//     }, 4000);
//   };

//   const goToImage = (index, e) => {
//     e.stopPropagation();
//     setCurrentImageIndex(index);
//   };

//   const goToPrev = (e) => {
//     e.stopPropagation();
//     setCurrentImageIndex(
//       (currentImageIndex - 1 + images.length) % images.length
//     );
//   };

//   const goToNext = (e) => {
//     e.stopPropagation();
//     setCurrentImageIndex((currentImageIndex + 1) % images.length);
//   };

//   const goToProductPage = () => router.push(`/products/${product.id}`);

//   // ✅ SAFE: Get current image URL with fallback
//   const currentImageUrl =
//     images[currentImageIndex]?.url || "/images/placeholder.jpg";

//   return (
//     <div
//       className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group ${className}`}
//     >
//       {/* Image Carousel */}
//       <div
//         className="relative aspect-square bg-gray-100 overflow-hidden"
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         ref={carouselRef}
//       >
//         {/* ✅ SAFE: Only render Image if we have a valid URL */}
//         {currentImageUrl && currentImageUrl !== "" ? (
//           <Image
//             src={currentImageUrl}
//             alt={product?.name || "Product image"}
//             width={300}
//             height={300}
//             className="w-full h-full object-cover transition-transform duration-300"
//             onError={(e) => {
//               e.target.src = "/images/placeholder.jpg";
//             }}
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-gray-200">
//             <div className="text-center text-gray-400">
//               <svg
//                 className="w-12 h-12 mx-auto mb-2"
//                 fill="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
//               </svg>
//               <span className="text-sm">No Image</span>
//             </div>
//           </div>
//         )}

//         {/* ✅ OPTIONAL: Image indicators for multiple images */}
//         {hasMultipleImages && (
//           <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
//             {images.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={(e) => goToImage(index, e)}
//                 className={`w-2 h-2 rounded-full transition-colors ${
//                   index === currentImageIndex ? "bg-white" : "bg-white/50"
//                 }`}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Info section clickable */}
//       <div className="p-3 cursor-pointer" onClick={goToProductPage}>
//         <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
//           {product.name}
//         </h3>
//         <p className="text-xs text-gray-600 line-clamp-2 mb-2">
//           BY: {product.brandName || product.sellerName || "Unknown Seller"}
//         </p>
//         <div className="flex items-center justify-between">
//           <span className="text-sm font-semibold">
//             ₹{product.price || "0.00"}
//           </span>
//           {product.rating > 0 && (
//             <div className="flex items-center gap-1 text-xs">
//               <span className="text-yellow-500">★</span>
//               <span>{product.rating.toFixed(1)}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function ProductCard({
  product,
  viewMode = "grid",
  className = "",
}) {
  // Hooks called unconditionally at top
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);

  if (!product) return null;

  // Image array filtered for valid URLs
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter((img) => img?.url)
      : [{ url: "/images/placeholder.jpg" }];

  const hasMultipleImages = images.length > 1;

  // Auto slide effect
  useEffect(() => {
    if (hasMultipleImages) {
      autoSlideRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000);
    }
    return () => clearInterval(autoSlideRef.current);
  }, [hasMultipleImages, images.length]);

  // Touch event handlers
  const onTouchStart = (e) => {
    if (!hasMultipleImages) return;
    e.stopPropagation();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    clearInterval(autoSlideRef.current);
  };

  const onTouchMove = (e) => {
    if (!hasMultipleImages) return;
    e.stopPropagation();
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (!hasMultipleImages) return;
    e.stopPropagation();
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setCurrentImageIndex((currentImageIndex + 1) % images.length);
    } else if (distance < -50) {
      setCurrentImageIndex(
        (currentImageIndex - 1 + images.length) % images.length
      );
    }
    autoSlideRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (currentImageIndex - 1 + images.length) % images.length
    );
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  const goToProductPage = () => router.push(`/products/${product.id}`);

  const currentImageUrl =
    images[currentImageIndex]?.url || "/images/placeholder.jpg";

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group ${className}`}
    >
      {/* Image Carousel */}
      <div
        className="relative aspect-square bg-gray-100 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        ref={carouselRef}
      >
        {/* Offer Badge */}
        {product.hasOffer && product.offerPercentage && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              {product.offerPercentage}% OFF
            </span>
          </div>
        )}

        {currentImageUrl ? (
          <Image
            src={currentImageUrl}
            alt={product?.name || "Product image"}
            width={300}
            height={300}
            className="w-full h-full object-cover transition-transform duration-300"
            onError={(e) => {
              e.target.src = "/images/placeholder.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
              </svg>
              <span className="text-sm">No Image</span>
            </div>
          </div>
        )}

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info section clickable */}
      <div className="p-3 cursor-pointer" onClick={goToProductPage}>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          BY: {product.businessName || product.sellerName || "Unknown Seller"}
        </p>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">
              ₹{product.hasOffer ? product.offerPrice : product.price}
            </span>
            {product.hasOffer && (
              <span className="text-xs text-gray-500 line-through">
                ₹{product.price}
              </span>
            )}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-yellow-500">★</span>
              <span>{product.rating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="text-gray-400">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="mt-2">
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <div className="mt-2">
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
              Only {product.stock} left
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
