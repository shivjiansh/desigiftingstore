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
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

export default function ProductCard({ product, className = "" }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef(null);

  if (!product) return null;

  // Determine if offer is live
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

  useEffect(() => {
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setIdx((i) => (i + 1) % images.length);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [images.length]);

  const openProduct = () => router.push(`/products/${product.id}`);

  return (
    <div
      className={`flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden ${className}`}
    >
      {/* Image with carousel */}
      <div
        className="relative w-full pb-[100%] bg-gray-100 cursor-pointer"
        onClick={openProduct}
      >
        <Image
          src={images[idx].url}
          alt={product.name}
          layout="fill"
          objectFit="cover"
        />
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
        {isOfferLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
            {product.offerPercentage}% OFF
          </div>
        )}
      </div>

      {/* Details */}
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

        {/* Seller Business Name */}
        {(product.businessName || product.sellerBusinessName) && (
          <div className="flex items-center mb-3">
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
              by {product.businessName || product.sellerBusinessName}
            </span>
          </div>
        )}

        {/* Pricing */}
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

        {/* Footer: Status & Savings */}
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
