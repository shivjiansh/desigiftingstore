// import { useState, useEffect } from "react";
// import Head from "next/head";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../../lib/firebase";
// import SellerLayout from "../../../components/seller/SellerLayout";
// import { notify } from "../../../lib/notifications";
// import { useSellerDashboard } from "../../../hooks/useSeller";
// import { ArrowUpIcon } from "@heroicons/react/24/outline";

// export default function AddProduct() {
//   const [user, setUser] = useState(null);
//   const {
//     profile,
//     metrics,
//     isLoading: sellerDataLoading,
//     loadData,
//   } = useSellerDashboard(user?.uid);
//   console.log("seller profile ===> ", profile);

  // const [product, setProduct] = useState({
  //   name: "",
  //   description: "",
  //   pricingType: "simple", // "simple" or "set"

  //   // Simple Pricing Fields
  //   price: "",

  //   // Set Pricing Fields
  //   setPricing: [],

  //   category: "",
  //   stock: "",
  //   tags: [],
  //   images: [],
  //   status: "active",
  //   isActive: "true",
  //   hasOffer: false,
  //   offerPrice: "",
  //   offerStartDate: "",
  //   offerEndDate: "",
  //   codAvailable: true,
  //   processingTime: "",
  //   businessName: "",

  //   salesMetrics: {
  //     totalSales: 0,
  //     totalRevenue: 0,
  //     monthlySales: {
  //       current: 0,
  //       previous: 0,
  //       byMonth: {
  //         "2025-01": 0,
  //         "2025-02": 0,
  //       },
  //     },
  //     monthlyRevenue: {
  //       current: 0,
  //       previous: 0,
  //       byMonth: {
  //         "2025-01": 0,
  //         "2025-02": 0,
  //       },
  //     },
  //   },
  //   specifications: {
  //     dimensions: "",
  //     weight: "",
  //     material: "",
  //     color: "",
  //     size: "",
  //   },
  //   badges: {
  //     isHotselling: false,
  //     isTrending: false,
  //     isToprated: false,
  //   },
  //   ratings: {
  //     average: 0,
  //     total: 0,
  //     breakdown: {
  //       5: 0,
  //       4: 0,
  //       3: 0,
  //       2: 0,
  //       1: 0,
  //     },
  //   },
  // });

//   const [newTag, setNewTag] = useState("");

//   // State for adding sets
//   const [newSet, setNewSet] = useState({
//     quantity: "",
//     price: "",
//     name: ""
//   });

//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageUploading, setImageUploading] = useState(false);
//   const router = useRouter();

//   const categories = [
//     "Home Decor",
//     "Clothing & Apparel",
//     "Accessories",
//     "Drinkware",
//     "Stationery & Office",
//     "Electronics & Tech",
//     "Jewelry & Watches",
//     "Toys & Games",
//     "Sports & Fitness",
//     "Beauty & Personal Care",
//     "Kitchen & Dining",
//     "Art & Collectibles",
//     "Custom Gifts",
//     "Other",
//   ];

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (!currentUser) {
//         router.push("/seller/auth/login");
//         return;
//       }
//       setUser(currentUser);
//       console.log("seller mafter assignment$$$$$$$", profile);
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const handleInputChange = (field, value) => {
//     if (field.includes(".")) {
//       const fieldParts = field.split(".");

//       if (fieldParts.length === 2) {
//         const [parent, child] = fieldParts;
//         setProduct((prev) => ({
//           ...prev,
//           [parent]: {
//             ...prev[parent],
//             [child]: value,
//           },
//         }));
//       } else if (fieldParts.length === 3) {
//         const [parent, child, grandchild] = fieldParts;
//         setProduct((prev) => ({
//           ...prev,
//           [parent]: {
//             ...prev[parent],
//             [child]: {
//               ...prev[parent][child],
//               [grandchild]: value,
//             },
//           },
//         }));
//       }
//     } else {
//       setProduct((prev) => ({
//         ...prev,
//         [field]: value,
//       }));
//     }

//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: null }));
//     }
//   };

//   // Handle pricing type change
//   const handlePricingTypeChange = (type) => {
//     setProduct((prev) => ({
//       ...prev,
//       pricingType: type,
//       price: type === "simple" ? prev.price : "",
//       setPricing: type === "set" ? prev.setPricing : [],
//     }));
//     // Clear pricing related errors
//     setErrors((prev) => ({
//       ...prev,
//       price: null,
//       setPricing: null,
//     }));
//   };

//   const handleOfferToggle = () => {
//     setProduct((prev) => ({
//       ...prev,
//       hasOffer: !prev.hasOffer,
//       offerPercentage: "",
//       offerStartDate: "",
//       offerEndDate: "",
//     }));
//   };

//   // Add a new set pricing
//   const addSetPricing = () => {
//     if (!newSet.quantity || !newSet.price) {
//       notify.error("Please enter both quantity and price for the set");
//       return;
//     }

//     const quantity = parseInt(newSet.quantity);
//     const price = parseFloat(newSet.price);

//     if (quantity <= 0) {
//       notify.error("Quantity must be greater than 0");
//       return;
//     }

//     if (price <= 0) {
//       notify.error("Price must be greater than 0");
//       return;
//     }

//     const existingSet = product.setPricing.find(
//       (set) => set.quantity === quantity
//     );
//     if (existingSet) {
//       notify.error(`A set with quantity ${quantity} already exists`);
//       return;
//     }

//     const setObj = {
//       id: `set-${Date.now()}`,
//       quantity: quantity,
//       price: price,
//       name: newSet.name || `Set of ${quantity}`,
//     };

//     setProduct((prev) => ({
//       ...prev,
//       setPricing: [...prev.setPricing, setObj].sort(
//         (a, b) => a.quantity - b.quantity
//       ),
//     }));

//     setNewSet({ quantity: "", price: "", name: "" });
//     notify.success(`Set of ${quantity} added successfully!`);
//   };

//   // Remove set pricing
//   const removeSetPricing = (setId) => {
//     setProduct((prev) => ({
//       ...prev,
//       setPricing: prev.setPricing.filter((set) => set.id !== setId),
//     }));
//     notify.success("Set pricing removed");
//   };

//   // Calculate minimum and maximum price from sets
//   const getPriceRange = () => {
//     if (product.setPricing.length === 0) return { min: 0, max: 0 };
//     const prices = product.setPricing.map(set => set.price);
//     return {
//       min: Math.min(...prices),
//       max: Math.max(...prices)
//     };
//   };

//   // Calculate price per unit from sets
//   const calculatePricePerUnit = (setPrice, quantity) => {
//     return (setPrice / quantity).toFixed(2);
//   };

  // const calculateOfferPrice = () => {
  //   if (!product.hasOffer || !product.price || !product.offerPercentage)
  //     return 0;
  //   const discount =
  //     (parseFloat(product.price) * parseFloat(product.offerPercentage)) / 100;
  //   return (parseFloat(product.price) - discount).toFixed(2);
  // };

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const addTag = () => {
//     if (newTag.trim() && !product.tags.includes(newTag.trim().toLowerCase())) {
//       setProduct((prev) => ({
//         ...prev,
//         tags: [...prev.tags, newTag.trim().toLowerCase()],
//       }));
//       setNewTag("");
//     }
//   };

//   const removeTag = (tagToRemove) => {
//     setProduct((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((tag) => tag !== tagToRemove),
//     }));
//   };

//   const uploadToCloudinary = async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append(
//       "upload_preset",
//       process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
//     );
//     formData.append("folder", "desigifting/products");

//     const response = await fetch(
//       `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//       {
//         method: "POST",
//         body: formData,
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to upload image");
//     }

//     const data = await response.json();
//     return {
//       url: data.secure_url,
//       publicId: data.public_id,
//       width: data.width,
//       height: data.height,
//     };
//   };

//   const handleImageUpload = async (files) => {
//     setImageUploading(true);
//     try {
//       const uploadPromises = Array.from(files).map(async (file) => {
//         if (file.size > 5 * 1024 * 1024) {
//           throw new Error(
//             `File ${file.name} is too large. Maximum size is 5MB.`
//           );
//         }
//         if (!file.type.startsWith("image/")) {
//           throw new Error(`File ${file.name} is not an image.`);
//         }
//         return uploadToCloudinary(file);
//       });

//       const uploadedImages = await Promise.all(uploadPromises);
//       setProduct((prev) => ({
//         ...prev,
//         images: [...prev.images, ...uploadedImages],
//       }));
//       notify.success(`${uploadedImages.length} image(s) uploaded successfully`);
//     } catch (error) {
//       console.error("Error uploading images:", error);
//       setErrors({ images: error.message });
//       notify.error(error.message);
//     } finally {
//       setImageUploading(false);
//     }
//   };

//   const removeImage = (imageIndex) => {
//     setProduct((prev) => ({
//       ...prev,
//       images: prev.images.filter((_, index) => index !== imageIndex),
//     }));
//   };

//   const validateProduct = () => {
//     const newErrors = {};

//     if (!product.name.trim()) {
//       newErrors.name = "Product name is required";
//     }

//     if (!product.description.trim()) {
//       newErrors.description = "Product description is required";
//     }

//     // Pricing validation - EITHER simple or set pricing required
//     if (product.pricingType === "simple") {
//       if (!product.price || parseFloat(product.price) <= 0) {
//         console.log("simple pt not found");
//         newErrors.price = "Valid price is required for simple pricing";
//       }
//     } else if (product.pricingType === "set") {
//       if (product.setPricing.length === 0) {
//         console.log("set addeing");
//         newErrors.setPricing = "Please add at least one set for set pricing";
//       }
//       // Validate each set
//       product.setPricing.forEach((set, index) => {
//         if (set.quantity <= 0) {
//           newErrors.setPricing = `Set ${index + 1}: Quantity must be greater than 0`;
//         }
//         if (set.price <= 0) {
//           newErrors.setPricing = `Set ${index + 1}: Price must be greater than 0`;
//         }
//       });
//     }

//     if (!product.stock || parseInt(product.stock) < 0) {
//       newErrors.stock = "Valid stock quantity is required";
//     }

//     if (product.images.length === 0) {
//       newErrors.images = "At least one product image is required";
//     }

//     if (product.hasOffer && product.pricingType == "simple") {
//       if (
//         !product.offerPercentage ||
//         parseFloat(product.offerPercentage) <= 0 ||
//         parseFloat(product.offerPercentage) >= 100
//       ) {
//         newErrors.offerPercentage =
//           "Valid offer percentage (1-99%) is required";
//       }
//       if (!product.offerStartDate) {
//         newErrors.offerStartDate = "Offer start date is required";
//       }
//       if (!product.offerEndDate) {
//         newErrors.offerEndDate = "Offer end date is required";
//       }
//       if (
//         product.offerStartDate &&
//         product.offerEndDate &&
//         new Date(product.offerStartDate) >= new Date(product.offerEndDate)
//       ) {
//         newErrors.offerEndDate = "Offer end date must be after start date";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const saveProduct = async (status = "active") => {
//     console.log("saved button clicked.....");
//     if (!validateProduct()) return;

//     try {
//       setIsLoading(true);
//       const user = auth.currentUser;
//       console.log(
//         "ye wala user pta nhi konsa hai dekhte hai   ++++++",
//         user
//       );
//       if (!user) throw new Error("Authentication required");

//       const idToken = await user.getIdToken();

//       // Prepare product data based on pricing type
//       let productData = {
//         ...product,
//         status: "active",
//         sellerId: user.uid,
//         sellerEmail: user.email,
//         pricingType: product.pricingType,
//         businessName: profile.businessInfo.businessName || "frictional",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };

//       // For simple pricing, remove setPricing
//       if (product.pricingType === "simple") {
//         productData.price = parseFloat(product.price);
//         productData.setPricing = [];
        // if (product.hasOffer) {
        //   productData.offerPrice = parseFloat(calculateOfferPrice());
        // }
//       } else {
//         // For set pricing, remove simple price
//         productData.price = 0;
//         productData.setPricing = product.setPricing;
//         productData.offerPrice = 0; // Offers don't apply to set pricing
//         productData.hasOffer = false;
//       }

//       console.log("sending product with data:", productData);

//       const response = await fetch("/api/products", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${idToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(productData),
//       });

//       const result = await response.json();
//       console.log("Response status:", result);

//       if (!response.ok) {
//         throw new Error(result.error || "Failed to save product");
//       }

//       if (result.success) {
//         notify.success(
//           `Product ${status === "active" ? "published" : "saved as draft"
//           } successfully!`
//         );
//         router.push("/seller/products");
//       } else {
//         throw new Error(result.error || "Failed to save product");
//       }
//     } catch (error) {
//       console.error("Error saving product:", error);
//       setErrors({ general: error.message });
//       notify.error(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   const priceRange = getPriceRange();

//   return (
//     <>
//       <Head>
//         <title>Add New Product - Seller Dashboard</title>
//         <meta name="description" content="Add a new product to your store" />
//       </Head>

//       <SellerLayout>
//         <div className="min-h-screen bg-gray-50">
//           {/* Header */}
//           <div className="bg-white shadow-sm border-b">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <div className="flex justify-between items-center py-6">
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900 mt-1">
//                     Add New Product
//                   </h1>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     onClick={() => saveProduct("draft")}
//                     disabled={isLoading}
//                     className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//                   >
//                     Save as Draft
//                   </button>
//                   <button
//                     onClick={() => saveProduct("active")}
//                     disabled={isLoading}
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//                   >
//                     {isLoading ? "Publishing..." : "Publish Product"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//             {/* General Error */}
//             {errors.general && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//                 <p className="text-red-800">{errors.general}</p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               {/* Main Content */}
//               <div className="lg:col-span-2 space-y-6">
//                 {/* Basic Information */}
//                 <div className="bg-white rounded-xl shadow-sm border p-6">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     Basic Information
//                   </h2>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Product Name *
//                       </label>
//                       <input
//                         type="text"
//                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                           errors.name ? "border-red-300" : "border-gray-300"
//                         }`}
//                         value={product.name}
//                         onChange={(e) =>
//                           handleInputChange("name", e.target.value)
//                         }
//                         placeholder="Enter product name"
//                       />
//                       {errors.name && (
//                         <p className="text-red-600 text-sm mt-1">
//                           {errors.name}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Description *
//                       </label>
//                       <textarea
//                         rows="4"
//                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                           errors.description
//                             ? "border-red-300"
//                             : "border-gray-300"
//                         }`}
//                         value={product.description}
//                         onChange={(e) =>
//                           handleInputChange("description", e.target.value)
//                         }
//                         placeholder="Describe your product in detail..."
//                       />
//                       {errors.description && (
//                         <p className="text-red-600 text-sm mt-1">
//                           {errors.description}
//                         </p>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Stock Quantity *
//                         </label>
//                         <input
//                           type="number"
//                           min="0"
//                           className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                             errors.stock ? "border-red-300" : "border-gray-300"
//                           }`}
//                           value={product.stock}
//                           onChange={(e) =>
//                             handleInputChange("stock", e.target.value)
//                           }
//                           placeholder="0"
//                         />
//                         {errors.stock && (
//                           <p className="text-red-600 text-sm mt-1">
//                             {errors.stock}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Processing Time
//                       </label>
//                       <select
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={product.processingTime}
//                         onChange={(e) =>
//                           handleInputChange("processingTime", e.target.value)
//                         }
//                       >
//                         <option value="1-2 business days">
//                           1-2 business days
//                         </option>
//                         <option value="3-4 business days">
//                           3-4 business days
//                         </option>
//                         <option value="5-7 business days">
//                           5-7 business days
//                         </option>
//                         <option value="2-3 weeks">2-3 weeks</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ✨ PRICING TYPE SELECTOR */}
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm p-6">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     Pricing Model *
//                   </h2>
//                   <p className="text-sm text-gray-600 mb-4">
//                     Choose how you want to price your product. You can offer either a single price for all quantities or create custom sets with fixed prices.
//                   </p>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Simple Pricing Option */}
//                     <div
//                       onClick={() => handlePricingTypeChange("simple")}
//                       className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                         product.pricingType === "simple"
//                           ? "border-blue-600 bg-blue-50"
//                           : "border-gray-300 bg-white hover:border-blue-400"
//                       }`}
//                     >
//                       <div className="flex items-start">
//                         <div className="flex-shrink-0 mt-1">
//                           <div
//                             className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                               product.pricingType === "simple"
//                                 ? "border-blue-600 bg-blue-600"
//                                 : "border-gray-300"
//                             }`}
//                           >
//                             {product.pricingType === "simple" && (
//                               <span className="text-white text-xs">✓</span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="ml-3">
//                           <h3 className="font-semibold text-gray-900">
//                             Simple Pricing
//                           </h3>
//                           <p className="text-sm text-gray-600 mt-1">
//                             Set one fixed price for your product. Customers buy any quantity at this price.
//                           </p>
//                           <div className="mt-3 text-sm">
//                             <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                               Single Price per Unit
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Set Pricing Option */}
//                     <div
//                       onClick={() => handlePricingTypeChange("set")}
//                       className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                         product.pricingType === "set"
//                           ? "border-green-600 bg-green-50"
//                           : "border-gray-300 bg-white hover:border-green-400"
//                       }`}
//                     >
//                       <div className="flex items-start">
//                         <div className="flex-shrink-0 mt-1">
//                           <div
//                             className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                               product.pricingType === "set"
//                                 ? "border-green-600 bg-green-600"
//                                 : "border-gray-300"
//                             }`}
//                           >
//                             {product.pricingType === "set" && (
//                               <span className="text-white text-xs">✓</span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="ml-3">
//                           <h3 className="font-semibold text-gray-900">
//                             Set Pricing
//                           </h3>
//                           <p className="text-sm text-gray-600 mt-1">
//                             Create custom bundles with fixed prices. E.g., Set of 4 for ₹299, Set of 8 for ₹599.
//                           </p>
//                           <div className="mt-3 text-sm">
//                             <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
//                               Bundle Pricing
//                             </span>
//                             <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
//                               Quantity Discounts
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Simple Pricing Section */}
//                 {product.pricingType === "simple" && (
//                   <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                       <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
//                         ₹
//                       </span>
//                       Simple Pricing
//                     </h2>
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Price per Unit (₹) *
//                         </label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                             errors.price ? "border-red-300" : "border-gray-300"
//                           }`}
//                           value={product.price}
//                           onChange={(e) =>
//                             handleInputChange("price", e.target.value)
//                           }
//                           placeholder="0.00"
//                         />
//                         {errors.price && (
//                           <p className="text-red-600 text-sm mt-1">
//                             {errors.price}
//                           </p>
//                         )}
//                         <p className="text-xs text-gray-500 mt-2">
//                           Customers can purchase any quantity at this fixed price per unit.
//                         </p>
//                       </div>

//                       {product.price && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                           <p className="text-sm text-blue-900">
//                             <strong>Price Preview:</strong> ₹{parseFloat(product.price).toFixed(2)} per unit
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Set Pricing Section */}
//                 {product.pricingType === "set" && (
//                   <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                       <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
//                         📦
//                       </span>
//                       Set Pricing
//                     </h2>

//                     <div className="space-y-4">
//                       {/* Info Banner */}
//                       <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                         <div className="flex items-start">
//                           <div className="flex-shrink-0">
//                             <svg
//                               className="h-5 w-5 text-green-400"
//                               fill="currentColor"
//                               viewBox="0 0 20 20"
//                             >
//                               <path
//                                 fillRule="evenodd"
//                                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                                 clipRule="evenodd"
//                               />
//                             </svg>
//                           </div>
//                           <div className="ml-3">
//                             <p className="text-sm text-green-800">
//                               <strong>Set pricing</strong> allows you to create multiple bundles with fixed prices. Each set has its own quantity and price. Example: Set of 4 for ₹299, Set of 8 for ₹599.
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Add New Set Form */}
//                       <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
//                         <h3 className="text-sm font-semibold text-gray-900 mb-3">
//                           Add New Set
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Quantity *
//                             </label>
//                             <input
//                               type="number"
//                               min="1"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                               value={newSet.quantity}
//                               onChange={(e) =>
//                                 setNewSet((prev) => ({
//                                   ...prev,
//                                   quantity: e.target.value,
//                                 }))
//                               }
//                               placeholder="e.g., 4"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Price (₹) *
//                             </label>
//                             <input
//                               type="number"
//                               step="0.01"
//                               min="0"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                               value={newSet.price}
//                               onChange={(e) =>
//                                 setNewSet((prev) => ({
//                                   ...prev,
//                                   price: e.target.value,
//                                 }))
//                               }
//                               placeholder="e.g., 299"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Name (Optional)
//                             </label>
//                             <input
//                               type="text"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                               value={newSet.name}
//                               onChange={(e) =>
//                                 setNewSet((prev) => ({
//                                   ...prev,
//                                   name: e.target.value,
//                                 }))
//                               }
//                               placeholder="e.g., Family Pack"
//                             />
//                           </div>
//                         </div>
//                         <button
//                           onClick={addSetPricing}
//                           className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//                         >
//                           Add Set
//                         </button>
//                       </div>

//                       {/* Display Existing Sets */}
//                       {product.setPricing.length > 0 && (
//                         <div className="space-y-3">
//                           <div className="flex items-center justify-between">
//                             <h3 className="text-sm font-semibold text-gray-900">
//                               Configured Sets ({product.setPricing.length})
//                             </h3>
//                             {priceRange.min > 0 && (
//                               <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                                 Price Range: ₹{priceRange.min.toFixed(2)} - ₹{priceRange.max.toFixed(2)}
//                               </span>
//                             )}
//                           </div>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {product.setPricing.map((set) => (
//                               <div
//                                 key={set.id}
//                                 className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
//                               >
//                                 <div className="flex justify-between items-start mb-3">
//                                   <div>
//                                     <h4 className="font-semibold text-gray-900">
//                                       {set.name}
//                                     </h4>
//                                     <p className="text-sm text-gray-600">
//                                       {set.quantity} units
//                                     </p>
//                                   </div>
//                                   <button
//                                     onClick={() => removeSetPricing(set.id)}
//                                     className="text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded"
//                                   >
//                                     Remove
//                                   </button>
//                                 </div>
//                                 <div className="border-t pt-3 mt-3">
//                                   <div className="flex justify-between items-center mb-2">
//                                     <span className="text-sm text-gray-600">
//                                       Price for Set:
//                                     </span>
//                                     <span className="text-lg font-bold text-green-600">
//                                       ₹{set.price.toFixed(2)}
//                                     </span>
//                                   </div>
//                                   <div className="bg-gray-50 rounded px-2 py-2">
//                                     <p className="text-xs text-gray-600">
//                                       <strong>Price per unit:</strong> ₹
//                                       {calculatePricePerUnit(set.price, set.quantity)}
//                                     </p>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {errors.setPricing && (
//                         <p className="text-red-600 text-sm mt-2">
//                           {errors.setPricing}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Product Specifications */}
//                 <div className="bg-white rounded-xl shadow-sm border p-6">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     Product Specifications
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Dimensions
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={product.specifications.dimensions}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "specifications.dimensions",
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., 10cm x 15cm x 5cm"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Weight
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={product.specifications.weight}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "specifications.weight",
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., 250g"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Material
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={product.specifications.material}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "specifications.material",
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., Cotton, Wood, Metal"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Color
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={product.specifications.color}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "specifications.color",
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., Red, Blue, Multi-color"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Size
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={product.specifications.size}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "specifications.size",
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g., XS, S, M, L, XL, One Size"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Offer Section - Only for Simple Pricing */}
//                 {product.pricingType === "simple" && (
//                   <div className="bg-white rounded-xl shadow-sm border p-6">
//                     <div className="flex items-center justify-between mb-4">
//                       <h2 className="text-lg font-semibold text-gray-900">
//                         Special Offer
//                       </h2>
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={product.hasOffer}
//                           onChange={handleOfferToggle}
//                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="ml-2 text-sm text-gray-700">
//                           Enable offer for this product
//                         </span>
//                       </label>
//                     </div>

//                     {product.hasOffer && (
//                       <div className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Discount %
//                             </label>
//                             <input
//                               type="number"
//                               min="1"
//                               max="99"
//                               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                                 errors.offerPercentage
//                                   ? "border-red-300"
//                                   : "border-gray-300"
//                               }`}
//                               value={product.offerPercentage}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   "offerPercentage",
//                                   e.target.value
//                                 )
//                               }
//                               placeholder="10"
//                             />
//                             {errors.offerPercentage && (
//                               <p className="text-red-600 text-sm mt-1">
//                                 {errors.offerPercentage}
//                               </p>
//                             )}
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Start Date
//                             </label>
//                             <input
//                               type="date"
//                               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                                 errors.offerStartDate
//                                   ? "border-red-300"
//                                   : "border-gray-300"
//                               }`}
//                               value={product.offerStartDate}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   "offerStartDate",
//                                   e.target.value
//                                 )
//                               }
//                             />
//                             {errors.offerStartDate && (
//                               <p className="text-red-600 text-sm mt-1">
//                                 {errors.offerStartDate}
//                               </p>
//                             )}
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                               End Date
//                             </label>
//                             <input
//                               type="date"
//                               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                                 errors.offerEndDate
//                                   ? "border-red-300"
//                                   : "border-gray-300"
//                               }`}
//                               value={product.offerEndDate}
//                               onChange={(e) =>
//                                 handleInputChange("offerEndDate", e.target.value)
//                               }
//                             />
//                             {errors.offerEndDate && (
//                               <p className="text-red-600 text-sm mt-1">
//                                 {errors.offerEndDate}
//                               </p>
//                             )}
//                           </div>
//                         </div>

//                         {product.price && product.offerPercentage && (
//                           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                             <div className="flex items-center justify-between">
//                               <div>
//                                 <p className="text-sm font-medium text-green-800">
//                                   Offer Price Preview
//                                 </p>
//                                 <p className="text-xs text-green-600">
//                                   Customers will see this discounted price
//                                 </p>
//                               </div>
//                               <div className="text-right">
//                                 <p className="text-lg font-bold text-green-800">
//                                   ₹{calculateOfferPrice()}
//                                 </p>
//                                 <p className="text-sm text-gray-500 line-through">
//                                   ₹{product.price}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Offer Not Available for Set Pricing */}
//                 {product.pricingType === "set" && (
//                   <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                     <div className="flex items-start">
//                       <div className="flex-shrink-0">
//                         <svg
//                           className="h-5 w-5 text-orange-400"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       </div>
//                       <div className="ml-3">
//                         <p className="text-sm text-orange-800">
//                           <strong>Note:</strong> Special offers are not available with set pricing. Each set has its own fixed price.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Product Images */}
//                 <div className="bg-white rounded-xl shadow-sm border p-6">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     Product Images *
//                   </h2>
//                   <div className="mb-4">
//                     <label className="block w-full">
//                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
//                         {imageUploading ? (
//                           <div className="flex items-center justify-center">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                             <span className="ml-3 text-gray-600">
//                               Uploading...
//                             </span>
//                           </div>
//                         ) : (
//                           <>
//                             <div className="text-4xl mb-4">📸</div>
//                             <p className="text-gray-600 mb-2">
//                               Click to upload images or drag and drop
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               PNG, JPG, JPEG up to 5MB each
//                             </p>
//                           </>
//                         )}
//                       </div>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*"
//                         className="hidden"
//                         onChange={(e) => handleImageUpload(e.target.files)}
//                         disabled={imageUploading}
//                       />
//                     </label>
//                     {errors.images && (
//                       <p className="text-red-600 text-sm mt-1">
//                         {errors.images}
//                       </p>
//                     )}
//                   </div>

//                   {product.images.length > 0 && (
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                       {product.images.map((image, index) => (
//                         <div key={index} className="relative group">
//                           <img
//                             src={image.url}
//                             alt={`Product ${index + 1}`}
//                             className="w-full h-32 object-cover rounded-lg border"
//                           />
//                           <button
//                             onClick={() => removeImage(index)}
//                             className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                           >
//                             ✕
//                           </button>
//                           {index === 0 && (
//                             <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
//                               Main Image
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Tags */}
//                 <div className="bg-white rounded-xl shadow-sm border p-6">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                     Product Tags
//                   </h2>
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {product.tags.map((tag, index) => (
//                       <span
//                         key={index}
//                         className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
//                       >
//                         {tag}
//                         <button
//                           onClick={() => removeTag(tag)}
//                           className="ml-1 text-blue-600 hover:text-blue-800"
//                         >
//                           ✕
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                   <div className="flex space-x-2">
//                     <input
//                       type="text"
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       value={newTag}
//                       onChange={(e) => setNewTag(e.target.value)}
//                       placeholder="Add a tag (e.g., custom, gift, personalized)"
//                       onKeyPress={(e) => e.key === "Enter" && addTag()}
//                     />
//                     <button
//                       onClick={addTag}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
//                     >
//                       Add
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Sidebar */}
//               <div className="space-y-6">
//                 {/* Product Status */}
//                 <div className="bg-white rounded-xl shadow-sm border p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                     Product Status
//                   </h3>
//                   <div className="space-y-3">
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         name="status"
//                         value="draft"
//                         checked={product.status === "draft"}
//                         onChange={(e) =>
//                           handleInputChange("status", e.target.value)
//                         }
//                         className="text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2">
//                         <span className="font-medium">Draft</span>
//                         <span className="block text-sm text-gray-600">
//                           Save without publishing
//                         </span>
//                       </span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         name="status"
//                         value="active"
//                         checked={product.status === "active"}
//                         onChange={(e) =>
//                           handleInputChange("status", e.target.value)
//                         }
//                         className="text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2">
//                         <span className="font-medium">Active</span>
//                         <span className="block text-sm text-gray-600">
//                           Visible to customers
//                         </span>
//                       </span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         name="status"
//                         value="fewleft"
//                         checked={product.status === "fewleft"}
//                         onChange={(e) =>
//                           handleInputChange("status", e.target.value)
//                         }
//                         className="text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2">
//                         <span className="font-medium">Few Left</span>
//                         <span className="block text-sm text-gray-600">
//                           Shows urgency to customers
//                         </span>
//                       </span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         name="status"
//                         value="inactive"
//                         checked={product.status === "inactive"}
//                         onChange={(e) =>
//                           handleInputChange("status", e.target.value)
//                         }
//                         className="text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2">
//                         <span className="font-medium">Inactive</span>
//                         <span className="block text-sm text-gray-600">
//                           Hidden from customers
//                         </span>
//                       </span>
//                     </label>
//                   </div>
//                 </div>

//                 {/* Product Badges */}
//                 <div className="bg-white rounded-xl shadow-sm border p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                     Product Badges
//                   </h3>
//                   <div className="space-y-3">
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={product.badges.isHotselling}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "badges.isHotselling",
//                             e.target.checked
//                           )
//                         }
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm">Hot Selling</span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={product.badges.isTrending}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "badges.isTrending",
//                             e.target.checked
//                           )
//                         }
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm">Trending</span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={product.badges.isToprated}
//                         onChange={(e) =>
//                           handleInputChange(
//                             "badges.isToprated",
//                             e.target.checked
//                           )
//                         }
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm">Top Rated</span>
//                     </label>
//                   </div>
//                 </div>

//                 {/* Additional Settings */}
//                 <div className="bg-white rounded-xl shadow-sm border p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                     Additional Settings
//                   </h3>
//                   <div className="space-y-3">
//                     <label className="flex items-center justify-between">
//                       <span className="text-sm font-medium text-gray-700">
//                         Cash on Delivery
//                       </span>
//                       <input
//                         type="checkbox"
//                         checked={product.codAvailable}
//                         onChange={(e) =>
//                           handleInputChange("codAvailable", e.target.checked)
//                         }
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                     </label>
//                   </div>
//                 </div>

//                 {/* Pricing Type Summary */}
//                 <div className={`rounded-xl p-6 border ${
//                   product.pricingType === "simple"
//                     ? "bg-blue-50 border-blue-200"
//                     : "bg-green-50 border-green-200"
//                 }`}>
//                   <h3 className={`text-sm font-semibold mb-3 ${
//                     product.pricingType === "simple"
//                       ? "text-blue-900"
//                       : "text-green-900"
//                   }`}>
//                     {product.pricingType === "simple"
//                       ? "💰 Simple Pricing Active"
//                       : "📦 Set Pricing Active"}
//                   </h3>
//                   <div className={`text-sm ${
//                     product.pricingType === "simple"
//                       ? "text-blue-800"
//                       : "text-green-800"
//                   }`}>
//                     {product.pricingType === "simple" ? (
//                       <div>
//                         <p className="font-medium mb-2">Single Price Model</p>
//                         {product.price ? (
//                           <div>
//                             <p>Price: <strong>₹{product.price}</strong></p>
//                             {product.hasOffer && (
//                               <p className="mt-1">
//                                 Offer: <strong>{product.offerPercentage}%</strong>
//                               </p>
//                             )}
//                           </div>
//                         ) : (
//                           <p className="text-gray-600">No price set yet</p>
//                         )}
//                       </div>
//                     ) : (
//                       <div>
//                         <p className="font-medium mb-2">Bundle Model</p>
//                         {product.setPricing.length > 0 ? (
//                           <div>
//                             <p>Sets Configured: <strong>{product.setPricing.length}</strong></p>
//                             {priceRange.min > 0 && (
//                               <p className="mt-1">
//                                 Price Range: <strong>₹{priceRange.min.toFixed(2)} - ₹{priceRange.max.toFixed(2)}</strong>
//                               </p>
//                             )}
//                           </div>
//                         ) : (
//                           <p className="text-gray-600">No sets added yet</p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Help & Tips */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//                   <h3 className="text-sm font-semibold text-blue-900 mb-3">
//                     💡 Pricing Tips
//                   </h3>
//                   <ul className="text-xs text-blue-800 space-y-2">
//                     {product.pricingType === "simple" ? (
//                       <>
//                         <li>• Set competitive pricing</li>
//                         <li>• Use offers to attract customers</li>
//                         <li>• Consider seasonal adjustments</li>
//                       </>
//                     ) : (
//                       <>
//                         <li>• Create 3-5 sets for variety</li>
//                         <li>• Price larger sets lower per unit</li>
//                         <li>• Use meaningful set names</li>
//                         <li>• Higher quantity = better value</li>
//                       </>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <button
//           onClick={scrollToTop}
//           className="fixed bottom-8 right-4 w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
//           aria-label="Back to top"
//         >
//           <ArrowUpIcon className="h-5 w-5" />
//         </button>
//       </SellerLayout>
//     </>
//   );
// }

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import SellerLayout from "../../../components/seller/SellerLayout";
import { notify } from "../../../lib/notifications";
import { useSellerDashboard } from "../../../hooks/useSeller";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/24/outline";

import { SYSTEM_ENTRYPOINTS } from "next/dist/shared/lib/constants";

export default function AddProduct() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [expandedSection, setExpandedSection] = useState("basic");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
   const {
     profile,
     metrics,
     isLoading: sellerDataLoading,
     loadData,
   } = useSellerDashboard(user?.uid);
  // Product State
  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    stock: "100",
    images: [],
    tags: [],
    pricingType: "simple",
    price: "",
    setPricing: [],
    variants: [],
    offerPrice: "",
    hasOffer: false,
    offerPercentage: "",
    offerStartDate: "",
    offerEndDate: "",
    specifications: {
      dimensions: "",
      weight: "",
      material: "",
      color: "",
      size: "",
    },
    salesMetrics: {
      totalSales: 0,
      totalRevenue: 0,
      monthlySales: {
        current: 0,
        previous: 0,
        byMonth: {
          "2025-01": 0,
          "2025-02": 0,
        },
      },
      monthlyRevenue: {
        current: 0,
        previous: 0,
        byMonth: {
          "2025-01": 0,
          "2025-02": 0,
        },
      },
    },
    specifications: {
      dimensions: "",
      weight: "",
      material: "",
      color: "",
      size: "",
    },
    ratings: {
      average: 0,
      total: 0,
      breakdown: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    },
    status: "active",
    codAvailable: true,
    processingTime: "1-2 business days",
    badges: {
      isHotselling: false,
      isTrending: false,
      isToprated: false,
    },
    businessName: "",
    sellerId: "",
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState("");
  const [newSet, setNewSet] = useState({ quantity: "", price: "", name: "" });
  const [newVariant, setNewVariant] = useState({
    name: "",
    attributes: { size: "" },
    price: ""
   
   
  });
    
  const processingTimeOptions = [
    "1-2 day",
    "3-5 days",
    "1 week",
    "2 weeks",
  ];

  const categories = [
    "Home Decor",
    "Personalized Gifts",
    "Accessories",
    "Clothing & Apparel",
    "Electronics & Tech",
    "Jewelry & Watches",
    "Toys & Games",
    "Sports & Fitness",
    "Beauty & Personal Care",
    "Kitchen & Dining",
    "Art & Collectibles",
    "Custom Gifts",
    "Other",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/seller/auth/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const fieldParts = field.split(".");
      if (fieldParts.length === 2) {
        const [parent, child] = fieldParts;
        setProduct((prev) => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value },
        }));
      }
    } else {
      setProduct((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePricingTypeChange = (type) => {
    setProduct((prev) => ({
      ...prev,
      pricingType: type,
      hasOffer: type === "simple" ? prev.hasOffer : false,
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) {
      notify.error("Tag cannot be empty");
      return;
    }
    if (product.tags.includes(newTag.toLowerCase())) {
      notify.error("Tag already added");
      return;
    }
    if (product.tags.length >= 5) {
      notify.error("Maximum 5 tags allowed");
      return;
    }
    setProduct((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.toLowerCase()],
    }));
    setNewTag("");
  };

  const removeTag = (tagToRemove) => {
    setProduct((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

   const calculateOfferPrice = () => {
     if (!product.hasOffer || !product.price || !product.offerPercentage)
       return 0;
     const discount =
       (parseFloat(product.price) * parseFloat(product.offerPercentage)) / 100;
     return (parseFloat(product.price) - discount).toFixed(2);
   };

  const addSetPricing = () => {
    if (!newSet.quantity || !newSet.price) {
      notify.error("Please enter both quantity and price");
      return;
    }
    const quantity = parseInt(newSet.quantity);
    const price = parseFloat(newSet.price);
    if (quantity <= 0 || price <= 0) {
      notify.error("Values must be greater than 0");
      return;
    }
    setProduct((prev) => ({
      ...prev,
      setPricing: [
        ...prev.setPricing,
        {
          id: "set-" + Date.now(),
          quantity,
          price,
          name: newSet.name || `Set of ${quantity}`,
        },
      ],
    }));
    setNewSet({ quantity: "", price: "", name: "" });
    notify.success("Set added!");
  };

  const removeSetPricing = (setId) => {
    setProduct((prev) => ({
      ...prev,
      setPricing: prev.setPricing.filter((set) => set.id !== setId),
    }));
  };

  const getPriceRange = () => {
    if (product.setPricing.length === 0) return { min: 0, max: 0 };
    const prices = product.setPricing.map((set) => set.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  const addVariant = () => {
    if (!newVariant.name.trim() || !newVariant.price ) {
      notify.error("Please fill all required fields");
      return;
    }
    setProduct((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          variantId: "var-" + Date.now(),
          ...newVariant,
          price: parseFloat(newVariant.price),
          stock: parseInt(newVariant.stock),
        },
      ],
    }));
    setNewVariant({
      name: "",
      attributes: { size: "", color: "" },
      price: "",
      
    });
    notify.success("Variant added!");
  };

  const removeVariant = (variantId) => {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.variantId !== variantId),
    }));
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (product.images.length + files.length > 10) {
      notify.error("Maximum 10 images allowed");
      return;
    }

    setImageUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File too large");
        }
        if (!file.type.startsWith("image")) {
          throw new Error("Not an image");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/" +
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME +
            "/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        return {
          id: Date.now() + Math.random(),
          url: data.secure_url,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
      notify.success("Images uploaded!");
    } catch (error) {
      notify.error("Upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (imageId) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const validateProduct = () => {
    const newErrors = {};

    if (!product.name.trim()) newErrors.name = "Name required";

    if (!product.description.trim())
      newErrors.description = "Description required";

   
    if (!product.images || product.images.length === 0)
      newErrors.images = "At least 1 image required";

    if (product.pricingType === "simple") {
      if (!product.price || parseFloat(product.price) <= 0)
        newErrors.price = "Valid price required";
    } else if (product.pricingType === "set") {
      if (!product.setPricing || product.setPricing.length === 0)
        newErrors.setPricing = "Add at least 1 set";
    } else if (product.pricingType === "variant") {
      if (!product.variants || product.variants.length === 0)
        newErrors.variants = "Add at least 1 variant";
    }
    console.log("6");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProduct = async (status = "active") => {
    if (!validateProduct()) {
      notify.error("Please fix errors");
      return;
    }

    try {
      setIsSaving(true);
      if (!user) throw new Error("Not authenticated");

      const idToken = await user.getIdToken();
     
      let productData = {
        ...product,
        status,
        sellerId: user.uid,
        sellerEmail: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        businessName: profile.businessInfo.businessName || "frictional",

      };

      if (product.pricingType === "simple") {
        productData.price = parseFloat(product.price);
        productData.setPricing = [];
        productData.variants = [];
        if (product.hasOffer) {
          productData.offerPrice = parseFloat(calculateOfferPrice());
        }
      } else if (product.pricingType === "set") {
        productData.price = 0;
        productData.variants = [];
      } else if (product.pricingType === "variant") {
        productData.price = product.variants[0]?.price || 0;
        productData.setPricing = [];
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + idToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      if (result.success) {
        notify.success(
          "Product " + (status === "active" ? "published" : "saved")
        );
        router.push("/seller/products");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SellerLayout>
    );
  }

  const priceRange = getPriceRange();

  return (
    <>
      <Head>
        <title>Add Product</title>
      </Head>

      <SellerLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Mobile Header */}
          <div className="sticky top-0 z-40 bg-white border-b lg:hidden">
            <div className="flex justify-between items-center p-4">
              <h1 className="text-lg font-bold text-gray-900">Add Product</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => saveProduct("draft")}
                  disabled={isSaving}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                >
                  Draft
                </button>
                <button
                  onClick={() => saveProduct("active")}
                  disabled={isSaving}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => saveProduct("draft")}
                  disabled={isSaving}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => saveProduct("active")}
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Publish Product
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Full width on mobile */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Basic Info - Collapsible on Mobile */}
                <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === "basic" ? "" : "basic"
                      )
                    }
                    className="w-full lg:cursor-default lg:pointer-events-none flex justify-between items-center p-4 lg:p-6 lg:border-0"
                  >
                    <h2 className="text-lg lg:text-xl font-bold">
                      Product Information
                    </h2>
                    <div className="lg:hidden">
                      {expandedSection === "basic" ? "▼" : "▶"}
                    </div>
                  </button>

                  {(expandedSection === "basic" ||
                    window.innerWidth >= 1024) && (
                    <div className="px-4 pb-4 lg:px-6 lg:pb-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Photo Frame"
                          value={product.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm lg:text-base"
                        />
                        {errors.name && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                          Description *
                        </label>
                        <textarea
                          rows="3"
                          placeholder="Describe your product..."
                          value={product.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm lg:text-base"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Processing Time
                          </label>
                          <select
                            value={product.processingTime}
                            onChange={(e) =>
                              handleInputChange(
                                "processingTime",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {processingTimeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (Max 5)
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Add tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={addTag}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <div
                              key={tag}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs lg:text-sm flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Images - Collapsible on Mobile */}
                <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === "images" ? "" : "images"
                      )
                    }
                    className="w-full lg:cursor-default lg:pointer-events-none flex justify-between items-center p-4 lg:p-6"
                  >
                    <h2 className="text-lg lg:text-xl font-bold">Images</h2>
                    <div className="lg:hidden">
                      {expandedSection === "images" ? "▼" : "▶"}
                    </div>
                  </button>

                  {(expandedSection === "images" ||
                    window.innerWidth >= 1024) && (
                    <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 lg:p-6 text-center mb-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                          id="image-upload"
                          disabled={imageUploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer"
                        >
                          {imageUploading ? (
                            <p className="text-gray-600 text-sm">
                              Uploading...
                            </p>
                          ) : (
                            <>
                              <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs lg:text-sm text-gray-600">
                                Click to upload (Max 5, 5MB each)
                              </p>
                            </>
                          )}
                        </label>
                      </div>

                      {product.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
                          {product.images.map((image, index) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt="Product"
                                className="w-full h-20 lg:h-24 object-cover rounded border"
                              />
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                                  Main
                                </div>
                              )}
                              <button
                                onClick={() => removeImage(image.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing Type */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg lg:rounded-xl p-4 lg:p-6">
                  <h2 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">
                    Pricing Model
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["simple", "set", "variant"].map((type) => (
                      <button
                        key={type}
                        onClick={() => handlePricingTypeChange(type)}
                        className={
                          "p-3 lg:p-4 rounded-lg border-2 text-center cursor-pointer transition " +
                          (product.pricingType === type
                            ? type === "simple"
                              ? "border-blue-600 bg-blue-50"
                              : "border-green-600 bg-green-50"
                            : "border-gray-300 bg-white")
                        }
                      >
                        <h3 className="text-sm lg:text-base font-bold">
                          {type === "simple"
                            ? "Simple"
                            : type === "set"
                            ? "📦 Set"
                            : "🎨 Variant"}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {type === "simple"
                            ? "Single"
                            : type === "set"
                            ? "Bundles"
                            : "Sizes"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Content - Collapsible on Mobile */}
                <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === "pricing" ? "" : "pricing"
                      )
                    }
                    className="w-full lg:cursor-default lg:pointer-events-none flex justify-between items-center p-4 lg:p-6"
                  >
                    <h2 className="text-lg lg:text-xl font-bold">
                      {product.pricingType === "simple"
                        ? "Pricing"
                        : product.pricingType === "set"
                        ? "Sets"
                        : "Variants"}
                    </h2>
                    <div className="lg:hidden">
                      {expandedSection === "pricing" ? "▼" : "▶"}
                    </div>
                  </button>

                  {(expandedSection === "pricing" ||
                    window.innerWidth >= 1024) && (
                    <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                      {product.pricingType === "simple" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Price (₹) *
                              </label>
                              <input
                                type="number"
                                placeholder="100"
                                value={product.price}
                                onChange={(e) =>
                                  handleInputChange("price", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={product.hasOffer}
                              onChange={(e) =>
                                handleInputChange("hasOffer", e.target.checked)
                              }
                              className="w-4 h-4 rounded"
                            />
                            <span className="ml-2 text-sm font-medium">
                              Add Offer
                            </span>
                          </label>

                          {product.hasOffer && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <input
                                type="number"
                                placeholder="%"
                                value={product.offerPercentage}
                                onChange={(e) =>
                                  handleInputChange(
                                    "offerPercentage",
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="date"
                                value={product.offerStartDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "offerStartDate",
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="date"
                                value={product.offerEndDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "offerEndDate",
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {product.pricingType === "set" && (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs lg:text-sm text-green-800">
                              Create bundles: Set of 4 for ₹299, Set of 8 for
                              ₹499
                            </p>
                          </div>

                          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                            <h4 className="text-sm font-semibold mb-2">
                              Add Set
                            </h4>
                            <div className="space-y-3">
                              <input
                                type="number"
                                placeholder="Qty"
                                value={newSet.quantity}
                                onChange={(e) =>
                                  setNewSet((prev) => ({
                                    ...prev,
                                    quantity: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                placeholder="Price"
                                value={newSet.price}
                                onChange={(e) =>
                                  setNewSet((prev) => ({
                                    ...prev,
                                    price: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <button
                                onClick={addSetPricing}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                              >
                                Add Set
                              </button>
                            </div>
                          </div>

                          {product.setPricing.length > 0 && (
                            <div className="space-y-2">
                              {product.setPricing.map((set) => (
                                <div
                                  key={set.id}
                                  className="border border-gray-200 rounded-lg p-3 bg-white"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-semibold text-sm">
                                        {set.name}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        ₹{set.price}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => removeSetPricing(set.id)}
                                      className="text-red-600 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {product.pricingType === "variant" && (
                        <div className="space-y-4">
                          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                            <h4 className="text-sm font-semibold mb-2">
                              Add Variant
                            </h4>
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Name (small, large)"
                                value={newVariant.name}
                                onChange={(e) =>
                                  setNewVariant((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Size (10cm X 10cm)"
                                value={newVariant.attributes.size}
                                onChange={(e) =>
                                  setNewVariant((prev) => ({
                                    ...prev,
                                    attributes: {
                                      ...prev.attributes,
                                      size: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <div className="grid grid-cols-1 gap-3">
                                <input
                                  type="number"
                                  placeholder="Price(in Rs)"
                                  value={newVariant.price}
                                  onChange={(e) =>
                                    setNewVariant((prev) => ({
                                      ...prev,
                                      price: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <button
                                onClick={addVariant}
                                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                              >
                                Add Variant
                              </button>
                            </div>
                          </div>

                          {product.variants.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {product.variants.map((variant) => (
                                <div
                                  key={variant.variantId}
                                  className="border border-gray-200 rounded-lg p-3 bg-white"
                                >
                                  <div className="flex justify-between mb-2">
                                    <p className="font-semibold text-sm">
                                      {variant.name}
                                    </p>
                                    <button
                                      onClick={() =>
                                        removeVariant(variant.variantId)
                                      }
                                      className="text-red-600 text-sm"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p>₹{variant.price}</p>
                                    <p>Size: {variant.attributes.size}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Specifications - Collapsible */}
                <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border">
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === "specs" ? "" : "specs"
                      )
                    }
                    className="w-full lg:cursor-default lg:pointer-events-none flex justify-between items-center p-4 lg:p-6"
                  >
                    <h2 className="text-lg lg:text-xl font-bold">
                      Specifications
                    </h2>
                    <div className="lg:hidden">
                      {expandedSection === "specs" ? "▼" : "▶"}
                    </div>
                  </button>

                  {(expandedSection === "specs" ||
                    window.innerWidth >= 1024) && (
                    <div className="px-4 pb-4 lg:px-6 lg:pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        <input
                          type="text"
                          placeholder="Dimensions"
                          value={product.specifications.dimensions}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.dimensions",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Weight"
                          value={product.specifications.weight}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.weight",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Material"
                          value={product.specifications.material}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.material",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Color"
                          value={product.specifications.color}
                          onChange={(e) =>
                            handleInputChange(
                              "specifications.color",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Sticky on Desktop, Collapsible on Mobile */}
              <div className="lg:col-span-1">
                <div className="hidden lg:block sticky top-28 space-y-6">
                  {/* Status */}
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-bold mb-4">Status</h3>
                    <div className="space-y-3">
                      {["active", "draft"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center text-sm"
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={product.status === status}
                            onChange={(e) =>
                              handleInputChange("status", e.target.value)
                            }
                            className="w-4 h-4"
                          />
                          <span className="ml-2 capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-bold mb-4">Badges</h3>
                    <div className="space-y-3">
                      {["isHotselling", "isTrending", "isToprated"].map(
                        (badge) => (
                          <label
                            key={badge}
                            className="flex items-center text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={product.badges[badge]}
                              onChange={(e) =>
                                handleInputChange(
                                  "badges." + badge,
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 rounded"
                            />
                            <span className="ml-2 capitalize">
                              {badge.replace("is", "")}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-bold mb-4">Settings</h3>
                    <label className="flex items-center justify-between text-sm">
                      <span>COD Available</span>
                      <input
                        type="checkbox"
                        checked={product.codAvailable}
                        onChange={(e) =>
                          handleInputChange("codAvailable", e.target.checked)
                        }
                        className="w-4 h-4 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Mobile Sidebar - Collapsible */}
                <div className="lg:hidden space-y-4">
                  <div className="bg-white rounded-lg shadow-sm border">
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === "sidebar" ? "" : "sidebar"
                        )
                      }
                      className="w-full flex justify-between items-center p-4"
                    >
                      <h3 className="font-bold">More Options</h3>
                      {expandedSection === "sidebar" ? "▼" : "▶"}
                    </button>

                    {expandedSection === "sidebar" && (
                      <div className="px-4 pb-4 space-y-6 border-t">
                        <div>
                          <h4 className="text-sm font-bold mb-3">Status</h4>
                          <div className="space-y-2">
                            {["active", "draft"].map((status) => (
                              <label
                                key={status}
                                className="flex items-center text-sm"
                              >
                                <input
                                  type="radio"
                                  name="status"
                                  value={status}
                                  checked={product.status === status}
                                  onChange={(e) =>
                                    handleInputChange("status", e.target.value)
                                  }
                                  className="w-4 h-4"
                                />
                                <span className="ml-2 capitalize">
                                  {status}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold mb-3">Badges</h4>
                          <div className="space-y-2">
                            {["isHotselling", "isTrending", "isToprated"].map(
                              (badge) => (
                                <label
                                  key={badge}
                                  className="flex items-center text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={product.badges[badge]}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "badges." + badge,
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className="ml-2 capitalize">
                                    {badge.replace("is", "")}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center justify-between text-sm">
                            <span>COD Available</span>
                            <input
                              type="checkbox"
                              checked={product.codAvailable}
                              onChange={(e) =>
                                handleInputChange(
                                  "codAvailable",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 rounded"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 shadow-lg lg:hidden"
          >
            ↑
          </button>
        </div>
      </SellerLayout>
    </>
  );
}