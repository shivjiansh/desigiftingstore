import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { notify } from "../../lib/notifications";
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  HomeIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { getAuth } from "firebase/auth";

export default function ProductDetails() {
  const router = useRouter();
  const { uid } = router.query;

  // State management
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Customization states
  const [customText, setCustomText] = useState("");
  const [customImages, setCustomImages] = useState([]);
  const [specialMessage, setSpecialMessage] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Offer live logic
  const now = new Date();
  const start = product?.offerStartDate && new Date(product.offerStartDate);
  const end = product?.offerEndDate && new Date(product.offerEndDate);
  const isOfferLive =
    product?.hasOffer &&
    product.offerPercentage > 0 &&
    start instanceof Date &&
    end instanceof Date &&
    now >= start &&
    now <= end;

  // Authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "Auth state changed:",
        currentUser ? "User logged in" : "User logged out"
      );
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load product data
  useEffect(() => {
    if (uid) {
      loadProductData();
    }
  }, [uid]);

  useEffect(() => {
    async function checkWishlist() {
      if (authLoading) {
        console.log("Auth still loading...");
        return;
      }

      try {
        if (!user) {
          console.log("User not authenticated");
          setIsWishlisted(false);
          return;
        }

        console.log("Checking wishlist status for product ID:", uid);
        const idToken = await user.getIdToken();

        const res = await fetch(`/api/user/wishlist?productId=${uid}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch wishlist");

        const result = await res.json();
        console.log("API response:", result);

        if (result.success) {
          setIsWishlisted(result.data.isWishlisted);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (err) {
        console.error(err);
        notify.error("Could not load wishlist status");
      }
    }
    checkWishlist();
    console.log("Wishlist check triggered => ", isWishlisted);
  }, [authLoading, user, uid]);

  const loadProductData = async () => {
    try {
      setLoading(true);

      console.log("Fetching product with ID:", uid);
      const productResponse = await fetch(`/api/products?id=${uid}`);
      const productResult = await productResponse.json();
      console.log("Fetched product result:", productResult);

      if (productResult.success) {
        setProduct(productResult.data);

        // Initialize customizations
        const initialCustomizations = {};
        productResult.data.customizationOptions?.forEach((option) => {
          if (option.required) {
            initialCustomizations[option.uid] = "";
          }
        });
        setSelectedCustomizations(initialCustomizations);

        // Load related products from same seller
        if (productResult.data.sellerId) {
          loadRelatedProducts(productResult.data.sellerId, uid);
        }
      } else {
        notify.error("Product not found");
        router.push("/products");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      notify.error("Failed to load product");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (sellerId, currentProductId) => {
    try {
      const response = await fetch(
        `/api/products?sellerId=${sellerId}&limit=6`
      );
      const result = await response.json();

      if (result.success) {
        const related =
          result.data.results?.filter((p) => p.id !== currentProductId) || [];
        setRelatedProducts(related.slice(0, 4));
      }
    } catch (error) {
      console.error("Error loading related products:", error);
    }
  };

  const handleCustomizationChange = (optionId, value) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (customImages.length + files.length > 5) {
      notify.error("Maximum 5 images allowed");
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 10MB)`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        return {
          id: Date.now() + Math.random(),
          url: data.secure_url,
          name: file.name,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setCustomImages((prev) => [...prev, ...uploadedImages]);
      notify.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      notify.error(error.message || "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeCustomImage = (imageId) => {
    setCustomImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const validateCustomizations = () => {
    if (!product?.customizationOptions) return true;

    for (const option of product.customizationOptions) {
      if (option.required && !selectedCustomizations[option.id]) {
        notify.error(`Please provide ${option.name}`);
        return false;
      }
    }
    return true;
  };

  const calculateTotalPrice = () => {
    const basePrice = isOfferLive ? product.offerPrice : product?.price || 0;
    return (basePrice * quantity).toFixed(2);
  };

  const handleBuyNow = () => {
    if (!user) {
      notify.error("Please login to continue");
      router.push("buyer/auth/login");
      return;
    }

    if (!validateCustomizations()) {
      return;
    }

    if (product.stock < quantity) {
      notify.error("Insufficient stock");
      return;
    }

    // Prepare checkout data with customizations
    const checkoutData = {
      items: [
        {
          productId: product.id,
          name: product.name,
          price: isOfferLive ? product.offerPrice : product.price,
          quantity: quantity,
          businessName: product.businessName,
          sellerId: product.sellerId,
          images: product.images,
        },
      ],
      customizations: {
        ...selectedCustomizations,
        customText: customText.trim(),
        customImages: customImages,
        specialMessage: specialMessage.trim(),
      },
      totalAmount: parseFloat(calculateTotalPrice()),
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  const handleAddToCart = async () => {
    if (!user) {
      notify.error("Please login to add to cart");
      router.push("/auth/login");
      return;
    }

    if (!validateCustomizations()) {
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          customizations: {
            ...selectedCustomizations,
            customText: customText.trim(),
            customImages: customImages,
            specialMessage: specialMessage.trim(),
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        notify.success("Added to cart!");
      } else {
        notify.error(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      notify.error("Failed to add to cart");
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      notify.error("Please login to add to wishlist");
      return;
    }

    try {
      console.log(
        isWishlisted ? "Removing from wishlist" : "Adding to wishlist"
      );
      const idToken = await user.getIdToken();
      const response = await fetch("/api/user/wishlist", {
        method: isWishlisted ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
      });

      const result = await response.json();
      if (result.success) {
        setIsWishlisted(!isWishlisted);
        notify.success(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist"
        );
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      notify.error("Failed to update wishlist");
    }
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify.success("Product link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="animate-pulse">
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
          <div className="h-96 bg-gray-300"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <Link href="/products" className="text-blue-600 hover:text-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - Desi Gifting</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images?.[0]?.url} />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-10">
        <Header />

        {/* Hero Image Section */}
        <div className="relative h-96 sm:h-[500px] lg:h-[600px] bg-white overflow-hidden">
          {isOfferLive && (
            <div className="absolute bottom-6 left-6 z-20 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold">
              {product.offerPercentage}% OFF
            </div>
          )}

          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[currentImageIndex]?.url || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-lg">No Image Available</span>
            </div>
          )}

          {/* Action Buttons Overlay */}
          <div className="absolute top-6 right-6 flex space-x-2 z-10">
            <button
              onClick={toggleWishlist}
              className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors"
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {isWishlisted ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={shareProduct}
              className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors"
              aria-label="Share product"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => router.back()}
              className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-colors flex items-center space-x-2"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="bg-white border-b border-gray-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-3 transition-all duration-200 hover:scale-105 relative ${
                      currentImageIndex === index
                        ? "border-emerald-500 ring-2 ring-emerald-500 ring-opacity-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Product Details - Left Column */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                  {product.description}
                </p>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={`w-5 h-5 ${
                            star <= product.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviewCount}{" "}
                      reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Purchase Section - Right Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border p-6 sticky top-8">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    {isOfferLive ? (
                      <>
                        <span className="text-3xl font-bold text-green-600">
                          ₹{product.offerPrice}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  {/* Offer End Date */}
                  {isOfferLive && product.offerEndDate && (
                    <div className="mb-2 text-sm text-orange-700">
                      🔥 Offer ends on {end.toLocaleDateString()}
                    </div>
                  )}

                  {product.stock < 10 && product.stock > 0 && (
                    <p className="text-orange-600 text-sm font-medium">
                      ⚠️ Only {product.stock} left in stock!
                    </p>
                  )}
                  {product.stock > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      ✔️ In stock
                    </p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-red-600 text-sm font-medium">
                      ❌ Out of Stock
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <div className="flex items-center justify-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="px-6 py-3 font-medium min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                {quantity > 1 && (
                  <div className="mb-6 bg-emerald-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        Subtotal:
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        ₹{calculateTotalPrice()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Customization Panel */}
                <div className="mb-6">
                  <button
                    onClick={() =>
                      setShowCustomizationPanel(!showCustomizationPanel)
                    }
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Add Personal Touch</span>
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform ${
                        showCustomizationPanel ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showCustomizationPanel && (
                    <div className="bg-white border border-gray-200 rounded-lg mt-4 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                        "Make Gift Special"
                      </h3>

                      <div className="space-y-6">
                        {/* Custom Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Text
                          </label>
                          <input
                            type="text"
                            placeholder="Enter name, message, or text to display"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            maxLength={100}
                          />

                          <p className="text-xs text-gray-500 mt-1">
                            {customText.length}/100 characters
                          </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Images (Max 5)
                          </label>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                              disabled={customImages.length >= 5}
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer block"
                            >
                              <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                {uploadingImages
                                  ? "Uploading..."
                                  : "Click to upload images"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG up to 10MB each
                              </p>
                            </label>
                          </div>

                          {/* Image Preview */}
                          {customImages.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-700 mb-3">
                                {customImages.length} image(s) uploaded
                              </p>
                              <div className="grid grid-cols-5 gap-2">
                                {customImages.map((image) => (
                                  <div
                                    key={image.id}
                                    className="relative group"
                                  >
                                    <img
                                      src={image.url}
                                      alt="Upload preview"
                                      className="w-full h-16 object-cover rounded border"
                                    />
                                    <button
                                      onClick={() =>
                                        removeCustomImage(image.id)
                                      }
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Special Instructions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Instructions
                            <span className="text-gray-500 font-normal">
                              {" "}
                              (Optional)
                            </span>
                          </label>
                          <textarea
                            rows="3"
                            placeholder="Any specific requirements or notes for the seller..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                            value={specialMessage}
                            onChange={(e) => setSpecialMessage(e.target.value)}
                            maxLength={300}
                          />

                          <p className="text-xs text-gray-500 mt-1">
                            {specialMessage.length}/300 characters
                          </p>
                        </div>

                        {/* Summary */}
                        {(customText ||
                          customImages.length > 0 ||
                          specialMessage) && (
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Customization Summary
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              {customText && (
                                <p>• Custom text: "{customText}"</p>
                              )}
                              {customImages.length > 0 && (
                                <p>• {customImages.length} image(s) uploaded</p>
                              )}
                              {specialMessage && (
                                <p>• Special instructions provided</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                >
                  {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                </button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  More from {product.businessName}
                </h2>
                <Link
                  href={`/store/${product.sellerId}`}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  aria-label={`Visit ${product.businessName} Store`}
                >
                  Visit Store
                  
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
