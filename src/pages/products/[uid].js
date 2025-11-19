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
import { useLogger } from "next-axiom";
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
  const log = new useLogger();
  const router = useRouter();
  const { uid } = router.query;

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
  const [selectedSet, setSelectedSet] = useState(null);

  const [customText, setCustomText] = useState("");
  const [customImages, setCustomImages] = useState([]);
  const [specialMessage, setSpecialMessage] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // ✅ OFFER LOGIC - defined FIRST
  const now = new Date();
  const start = product?.offerStartDate && new Date(product.offerStartDate);
  const end = product?.offerEndDate && new Date(product.offerEndDate);
  const isOfferLive =
    product?.pricingType === "simple" &&
    product?.hasOffer &&
    product.offerPercentage > 0 &&
    start instanceof Date &&
    end instanceof Date &&
    now >= start &&
    now <= end;

  // ✅ Helper functions
  const getMinPrice = () => {
    if (product?.pricingType === "set" && product?.setPricing?.length > 0) {
      const prices = product.setPricing.map((s) => parseFloat(s.price) || 0);
      return Math.min(...prices);
    } else if (
      product?.pricingType === "variant" &&
      product?.variants?.length > 0
    ) {
      const prices = product.variants.map((v) => parseFloat(v.price) || 0);
      return Math.min(...prices);
    } else {
      return parseFloat(product?.price) || 0;
    }
  };

  const getMaxPrice = () => {
    if (product?.pricingType === "set" && product?.setPricing?.length > 0) {
      const prices = product.setPricing.map((s) => parseFloat(s.price) || 0);
      return Math.max(...prices);
    } else if (
      product?.pricingType === "variant" &&
      product?.variants?.length > 0
    ) {
      const prices = product.variants.map((v) => parseFloat(v.price) || 0);
      return Math.max(...prices);
    } else {
      return parseFloat(product?.price) || 0;
    }
  };

  // ✅ getCurrentPrice - INDEX BASED for variants
  const getCurrentPrice = () => {
    // SET PRICING
    if (product?.pricingType === "set" && selectedSet) {
      const selected = product.setPricing.find((s) => {
        const setId = s.id || s.uid || s._id;
        return String(setId) === String(selectedSet);
      });
      return selected ? parseFloat(selected.price) : getMinPrice();
    }

    // ✅ VARIANT PRICING - INDEX BASED
    if (product?.pricingType === "variant" && selectedSet) {
      const indexMatch = selectedSet.match(/variant-(\d+)/);
      if (indexMatch) {
        const index = parseInt(indexMatch[1]);
        const selected = product.variants[index];
        if (selected && selected.price) {
          const price = parseFloat(selected.price);
          return price;
        }
      }
      return getMinPrice();
    }

    // SIMPLE PRICING
    if (product?.pricingType === "simple") {
      return isOfferLive
        ? parseFloat(product.offerPrice)
        : parseFloat(product?.price) || 0;
    }

    return getMinPrice();
  };

  const calculateTotalPrice = () => {
    const basePrice = getCurrentPrice();
    const total = (basePrice * quantity).toFixed(2);
    return total;
  };

  // Authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
      if (authLoading) return;
      try {
        if (!user) {
          setIsWishlisted(false);
          return;
        }
        const idToken = await user.getIdToken();
        log.info("fetching wishlist ");
        const res = await fetch(`/api/user/wishlist?productId=${uid}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const result = await res.json();
        if (result.success) {
          setIsWishlisted(result.data.isWishlisted);
        }
      } catch (err) {
        log.error(err);
      }
    }
    checkWishlist();
  }, [authLoading, user, uid]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const productResponse = await fetch(`/api/products?id=${uid}`);
      const productResult = await productResponse.json();

      if (productResult.success) {
        setProduct(productResult.data);
        log.info('Product fetched ');
        const initialCustomizations = {};
        productResult.data.customizationOptions?.forEach((option) => {
          if (option.required) {
            initialCustomizations[option.uid] = "";
          }
        });
        setSelectedCustomizations(initialCustomizations);

        // ✅ Only initialize for SET, NOT for VARIANT
        if (
          productResult.data.pricingType === "set" &&
          productResult.data.setPricing?.length > 0
        ) {
          const firstSet = productResult.data.setPricing[0];
          const setId = firstSet.id || firstSet.uid || firstSet._id;
          setSelectedSet(setId);
        }

        if (productResult.data.sellerId) {
          loadRelatedProducts(productResult.data.sellerId, uid);
        }
      } else {
        notify.error("Product not found");
        router.push("/products");
      }
    } catch (error) {
      log.error("Error loading product:", error);
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
      log.error("Error loading related products:", error);
    }
  };

  const handleCustomizationChange = (optionId, value) => {
    setSelectedCustomizations((prev) => ({ ...prev, [optionId]: value }));
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
          { method: "POST", body: formData }
        );
        if (!response.ok) throw new Error("Failed to upload image");
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
      log.error("Error uploading images:", error);
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

  const handleBuyNow = () => {
    if (!user) {
      notify.error("Please login to continue");
      router.push("/buyer/auth/login");
      return;
    }

    // Validate variant/set selection
    if (product?.pricingType === "variant" && !selectedSet) {
      notify.error("Please select a variant");
      return;
    }
    if (product?.pricingType === "set" && !selectedSet) {
      notify.error("Please select a set");
      return;
    }

    if (!validateCustomizations()) return;
    if (product.stock < quantity) {
      notify.error("Insufficient stock");
      return;
    }

    // ✅ Get variant/set details if applicable
    let variantData = null;
    let setData = null;

    if (product?.pricingType === "variant" && selectedSet) {
      // Extract index from "variant-0", "variant-1"
      const indexMatch = selectedSet.match(/variant-(\d+)/);
      if (indexMatch) {
        const index = parseInt(indexMatch[1]);
        variantData = product.variants[index];
      }
    }

    if (product?.pricingType === "set" && selectedSet) {
      // Find set by ID
      setData = product.setPricing.find(
        (s) => String(s.id || s.uid || s._id) === String(selectedSet)
      );
    }

    // ✅ Build checkout data with variant/set details
    const checkoutData = {
      items: [
        {
          productId: product.id,
          name: product.name,
          pricingType: product.pricingType,
          cod: product.codAvailable,
          // ✅ Include variant data if applicable
          ...(variantData && {
            selectedVariant: {
              id: selectedSet,
              name: variantData.name,
              description: variantData.description,
              price: variantData.price,
            },
          }),

          // ✅ Include set data if applicable
          ...(setData && {
            selectedSet: {
              id: selectedSet,
              name: setData.name,
              quantity: setData.quantity,
              price: setData.price,
            },
          }),

          price: getCurrentPrice(),
          quantity: quantity,
          businessName: product.businessName,
          sellerId: product.sellerId,
          images: product.images,
          sellerEmail: product.sellerEmail,
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

    log.info("Checkout Data:", checkoutData);
    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  const toggleWishlist = async () => {
    if (!user) {
      log.info("Random checkout tried");
      notify.error("Please login to add to wishlist");
      return;
    }
    try {
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
        log.info("user added product in wishlist "+ user.uid.slice(0,5)); //user uid
        setIsWishlisted(!isWishlisted);
        notify.success(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist"
        );
      }
    } catch (error) {
      log.error("Error updating wishlist:", error);
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
        log.error("Error sharing:", error);
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
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-10">
        <Header />

        {/* Hero Image */}
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

          <div className="absolute top-6 right-6 flex space-x-2 z-10">
            <button
              onClick={toggleWishlist}
              className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
            >
              {isWishlisted ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={shareProduct}
              className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => router.back()}
              className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="bg-white border-b border-gray-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-3 transition-all ${
                      currentImageIndex === index
                        ? "border-emerald-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name}`}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {product.description}
              </p>
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
                    {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Pricing & Purchase */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border p-6 sticky top-8">
                {/* ✅ PRICING - All 3 types */}
                {product?.pricingType === "set" ? (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Available Sets
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {product.setPricing?.map((set, index) => {
                        const setId =
                          set.id || set.uid || set._id || `set-${index}`;
                        return (
                          <button
                            key={setId}
                            onClick={() => {
                              setSelectedSet(setId);
                              setQuantity(1);
                            }}
                            className={`w-full p-3 rounded-lg border-2 text-left ${
                              selectedSet === setId
                                ? "border-emerald-500 bg-emerald-50 shadow-md"
                                : "border-gray-300 bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {set.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {set.quantity} units
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-emerald-600">
                                    ₹{parseFloat(set.price).toFixed(2)}
                                  </p>
                                </div>
                                {selectedSet === setId && (
                                  <CheckIcon className="w-5 h-5 text-emerald-600" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : product?.pricingType === "variant" ? (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Variant
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {product.variants?.map((variant, index) => {
                        const variantId = `variant-${index}`;
                        return (
                          <button
                            key={variantId}
                            onClick={() => {
                              
                              setSelectedSet(variantId);
                              setQuantity(1);
                            }}
                            className={`w-full p-3 rounded-lg border-2 text-left ${
                              selectedSet === variantId
                                ? "border-emerald-500 bg-emerald-50 shadow-md"
                                : "border-gray-300 bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {variant.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {variant.attributes.size || ""}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <p className="text-lg font-bold text-emerald-600">
                                  ₹{parseFloat(variant.price).toFixed(2)}
                                </p>
                                {selectedSet === variantId && (
                                  <CheckIcon className="w-5 h-5 text-emerald-600" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
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
                    {isOfferLive && product.offerEndDate && (
                      <div className="mb-2 text-sm text-orange-700">
                        🔥 Offer ends on {end.toLocaleDateString()}
                      </div>
                    )}
                    {product.stock < 10 && product.stock > 0 && (
                      <p className="text-orange-600 text-sm">
                        ⚠️ Only {product.stock} left!
                      </p>
                    )}
                    {product.stock > 0 && (
                      <p className="text-green-600 text-sm">✔️ In stock</p>
                    )}
                    {product.stock === 0 && (
                      <p className="text-red-600 text-sm">❌ Out of Stock</p>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <div className="flex items-center justify-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="px-6 py-3 font-medium">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="p-3"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {quantity > 1 && (
                  <div className="mb-6 bg-emerald-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium">Subtotal:</span>
                      <span className="text-lg font-bold text-emerald-600">
                        ₹{calculateTotalPrice()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Customization */}
                <div className="mb-6">
                  <button
                    onClick={() =>
                      setShowCustomizationPanel(!showCustomizationPanel)
                    }
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-between"
                  >
                    <span>Add Personal Touch</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 ${
                        showCustomizationPanel ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showCustomizationPanel && (
                    <div className="bg-white border border-gray-200 rounded-lg mt-4 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Make Gift Special
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Custom Text
                          </label>
                          <input
                            type="text"
                            placeholder="Enter name or message"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            maxLength={100}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {customText.length}/100
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Upload Images (Max 5)
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer"
                            >
                              <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                {uploadingImages
                                  ? "Uploading..."
                                  : "Click to upload"}
                              </p>
                            </label>
                          </div>
                          {customImages.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm mb-3">
                                {customImages.length} image(s)
                              </p>
                              <div className="grid grid-cols-5 gap-2">
                                {customImages.map((img) => (
                                  <div key={img.id} className="relative">
                                    <img
                                      src={img.url}
                                      alt="preview"
                                      className="w-full h-16 object-cover rounded"
                                    />
                                    <button
                                      onClick={() => removeCustomImage(img.id)}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Special Instructions (Optional)
                          </label>
                          <textarea
                            rows="3"
                            placeholder="Any notes..."
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 resize-none"
                            value={specialMessage}
                            onChange={(e) => setSpecialMessage(e.target.value)}
                            maxLength={300}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {specialMessage.length}/300
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:bg-gray-400 text-lg"
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
                <h2 className="text-2xl font-bold">
                  More from {product.businessName}
                </h2>
                <Link
                  href={`/store/${product.sellerId}`}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-md"
                >
                  Visit Store
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
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
