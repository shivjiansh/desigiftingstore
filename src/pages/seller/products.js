// import { useState, useEffect } from "react";
// import Head from "next/head";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../lib/firebase";
// import SellerLayout from "../../components/seller/SellerLayout";
// import { notify } from "../../lib/notifications";
// import { ArrowUpIcon } from "@heroicons/react/24/outline";
// import {
//   PlusIcon,
//   MagnifyingGlassIcon,
//   AdjustmentsHorizontalIcon,
//   EyeIcon,
//   PencilIcon,
//   TrashIcon,
//   PhotoIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   XMarkIcon,
// } from "@heroicons/react/24/outline";

// export default function SellerProducts() {
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [productToDelete, setProductToDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState(null);
//   const router = useRouter();

//   const productsPerPage = 12;

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (!currentUser) {
//         router.push("/seller/auth/login");
//         return;
//       }

//       setUser(currentUser);
//       await loadProducts();
//     });

//     return () => unsubscribe();
//   }, [router]);

//   useEffect(() => {
//     filterProducts();
//   }, [products, searchTerm, categoryFilter, statusFilter]);

//   const loadProducts = async () => {
//     try {
//       setIsLoading(true);

//       const user = auth.currentUser;
//       if (!user) {
//         throw new Error("Authentication required");
//       }

//       const idToken = await user.getIdToken();

//       const response = await fetch("/api/products?sellerId=" + user.uid, {
//         headers: {
//           Authorization: "Bearer " + idToken,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log("🔍 API Response:", data);

//         if (data.success) {
//           const productsArray = data.data?.results || [];
//           console.log("✅ Products array:", productsArray);
//           setProducts(productsArray);
//         } else {
//           console.error("API Error:", data.error);
//           notify.error("Failed to load products");
//           setProducts([]);
//         }
//       } else {
//         const errorData = await response.json();
//         console.error("HTTP Error:", response.status, errorData);
//         notify.error("Failed to load products");
//         setProducts([]);
//       }
//     } catch (error) {
//       console.error("Error loading products:", error);
//       notify.error("Failed to load products");
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filterProducts = () => {
//     let filtered = products;

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           product.description
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           (product.tags &&
//             product.tags.some((tag) =>
//               tag.toLowerCase().includes(searchTerm.toLowerCase())
//             ))
//       );
//     }

//     if (categoryFilter !== "all") {
//       filtered = filtered.filter(
//         (product) => product.category === categoryFilter
//       );
//     }

//     if (statusFilter !== "all") {
//       filtered = filtered.filter((product) => product.status === statusFilter);
//     }

//     setFilteredProducts(filtered);
//     setCurrentPage(1);
//   };

//   const deleteProduct = async (productId) => {
//     try {
//       setDeleting(true);

//       const user = auth.currentUser;
//       if (!user) throw new Error("Authentication required");

//       const idToken = await user.getIdToken();

//       const response = await fetch("/api/products/" + productId, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer " + idToken,
//         },
//       });

//       if (response.ok) {
//         const result = await response.json();
//         if (result.success) {
//           const updatedProducts = products.filter(
//             (product) => product.id !== productId
//           );
//           setProducts(updatedProducts);
//           setShowDeleteModal(false);
//           setProductToDelete(null);
//           notify.success("Product deleted successfully!");
//         } else {
//           throw new Error(result.error || "Failed to delete product");
//         }
//       } else {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to delete product");
//       }
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       notify.error(error.message || "Failed to delete product");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const updateProductStatus = async (productId, newStatus) => {
//     try {
//       setUpdatingStatus(productId);

//       const user = auth.currentUser;
//       if (!user) throw new Error("Authentication required");

//       const idToken = await user.getIdToken();

//       const response = await fetch("/api/products/" + productId, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer " + idToken,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Failed to update status");
//       }

//       const result = await response.json();

//       if (result.success) {
//         setProducts((prevProducts) =>
//           prevProducts.map((product) =>
//             product.id === productId
//               ? {
//                   ...product,
//                   status: newStatus,
//                   updatedAt: new Date().toISOString(),
//                 }
//               : product
//           )
//         );

//         const statusMessages = {
//           active: "Product activated successfully!",
//           inactive: "Product deactivated successfully!",
//           fewleft: 'Product marked as "Few Left" successfully!',
//           draft: "Product moved to draft successfully!",
//         };

//         notify.success(statusMessages[newStatus]);
//       } else {
//         throw new Error(result.error || "Failed to update product status");
//       }
//     } catch (error) {
//       console.error("Error updating product status:", error);

//       notify.error(
//         error.message === "Authentication required"
//           ? "Please log in to continue"
//           : error.message || "Failed to update product status"
//       );
//     } finally {
//       setUpdatingStatus(null);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "active":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "inactive":
//         return "bg-red-100 text-red-800 border-red-200";
//       case "fewleft":
//         return "bg-orange-100 text-orange-800 border-orange-200";
//       case "draft":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   // ✅ HELPER: Get display price based on pricing type
//   const getDisplayPrice = (product) => {
//     if (
//       product.pricingType === "set" &&
//       product.setPricing &&
//       product.setPricing.length > 0
//     ) {
//       // For set pricing, get min and max from sets
//       const prices = product.setPricing.map((set) => set.price);
//       const minPrice = Math.min(...prices);
//       const maxPrice = Math.max(...prices);

//       if (minPrice === maxPrice) {
//         return "₹" + minPrice;
//       } else {
//         return "₹" + minPrice + " - ₹" + maxPrice;
//       }
//     } else {
//       // For simple pricing, show the price or offer price
//       const now = new Date();
//       const start = product.offerStartDate
//         ? new Date(product.offerStartDate)
//         : null;
//       const end = product.offerEndDate ? new Date(product.offerEndDate) : null;
//       const isOfferLive =
//         product.hasOffer &&
//         product.offerPercentage > 0 &&
//         start instanceof Date &&
//         end instanceof Date &&
//         now >= start &&
//         now <= end;

//       if (isOfferLive) {
//         return "₹" + product.offerPrice;
//       } else {
//         return "₹" + product.price;
//       }
//     }
//   };

//   // ✅ HELPER: Get original price for line-through
//   const getOriginalPrice = (product) => {
//     if (product.pricingType === "set") {
//       return null; // No line-through for set pricing
//     } else {
//       const now = new Date();
//       const start = product.offerStartDate
//         ? new Date(product.offerStartDate)
//         : null;
//       const end = product.offerEndDate ? new Date(product.offerEndDate) : null;
//       const isOfferLive =
//         product.hasOffer &&
//         product.offerPercentage > 0 &&
//         start instanceof Date &&
//         end instanceof Date &&
//         now >= start &&
//         now <= end;

//       return isOfferLive ? "₹" + product.price : null;
//     }
//   };

//   // ✅ HELPER: Check if offer is live for simple pricing
//   const isOfferLive = (product) => {
//     if (product.pricingType === "set") return false; // No offers for set pricing

//     const now = new Date();
//     const start = product.offerStartDate
//       ? new Date(product.offerStartDate)
//       : null;
//     const end = product.offerEndDate ? new Date(product.offerEndDate) : null;
//     return (
//       product.hasOffer &&
//       product.offerPercentage > 0 &&
//       start instanceof Date &&
//       end instanceof Date &&
//       now >= start &&
//       now <= end
//     );
//   };

//   // Get unique categories from products
//   const categories = [
//     ...new Set(products.map((product) => product.category)),
//   ].filter(Boolean);

//   // Pagination
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = filteredProducts.slice(
//     indexOfFirstProduct,
//     indexOfLastProduct
//   );
//   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

//   if (isLoading) {
//     return (
//       <SellerLayout>
//         <div className="min-h-screen flex items-center justify-center bg-gray-50">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading products...</p>
//           </div>
//         </div>
//       </SellerLayout>
//     );
//   }

//   return (
//     <>
//       <Head>
//         <title>Products - Seller Dashboard</title>
//         <meta name="description" content="Manage your product catalog" />
//       </Head>

//       <SellerLayout>
//         <div className="min-h-screen bg-gray-50">
//           {/* Header */}
//           <div className="bg-white shadow-sm border-b">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <div className="flex justify-between items-center py-6">
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900 mt-1">
//                     Product Management
//                   </h1>
//                   <p className="text-gray-600">
//                     Manage and organize your product catalog
//                   </p>
//                 </div>
//                 <Link
//                   href="/seller/products/add"
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//                 >
//                   <PlusIcon className="w-4 h-4" />
//                   <span>Add Product</span>
//                 </Link>
//               </div>
//             </div>
//           </div>

//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//             {/* Filters */}
//             <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Search Products
//                   </label>
//                   <div className="relative">
//                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       placeholder="Search by name, description, or tags..."
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <select
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="fewleft">Few Left</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </div>
//                 <div className="flex items-end">
//                   <button
//                     onClick={() => {
//                       setSearchTerm("");
//                       setCategoryFilter("all");
//                       setStatusFilter("all");
//                     }}
//                     className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors w-full"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Products Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
//               <div className="bg-white rounded-xl shadow-sm p-6 border">
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-blue-600">
//                     {products.length}
//                   </p>
//                   <p className="text-sm text-gray-600">Total Products</p>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl shadow-sm p-6 border">
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-green-600">
//                     {products.filter((p) => p.status === "active").length}
//                   </p>
//                   <p className="text-sm text-gray-600">Active</p>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl shadow-sm p-6 border">
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-orange-600">
//                     {products.filter((p) => p.status === "fewleft").length}
//                   </p>
//                   <p className="text-sm text-gray-600">Few Left</p>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl shadow-sm p-6 border">
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-red-600">
//                     {products.filter((p) => p.status === "inactive").length}
//                   </p>
//                   <p className="text-sm text-gray-600">Inactive</p>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl shadow-sm p-6 border">
//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-yellow-600">
//                     {products.filter((p) => p.status === "draft").length}
//                   </p>
//                   <p className="text-sm text-gray-600">Draft</p>
//                 </div>
//               </div>
//             </div>

//             {/* Products Grid */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Products ({filteredProducts.length})
//                 </h2>
//                 <div className="text-sm text-gray-600">
//                   {totalPages > 0 && (
//                     <>
//                       Page {currentPage} of {totalPages}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {filteredProducts.length === 0 ? (
//                 <div className="text-center py-12">
//                   <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">
//                     {products.length === 0
//                       ? "No products yet"
//                       : "No products found"}
//                   </h3>
//                   <p className="text-gray-600 mb-4">
//                     {products.length === 0
//                       ? "Get started by creating your first product."
//                       : "Try adjusting your search or filter criteria."}
//                   </p>
//                   {products.length === 0 && (
//                     <Link
//                       href="/seller/products/add"
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
//                     >
//                       <PlusIcon className="w-4 h-4" />
//                       <span>Add Your First Product</span>
//                     </Link>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                     {currentProducts.map((product) => (
//                       <div
//                         key={product.id}
//                         className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
//                       >
//                         {/* Product Image with Offer Badge */}
//                         <div className="aspect-square bg-gray-200 flex items-center justify-center relative">
//                           {product.images?.[0]?.url ? (
//                             <img
//                               src={product.images[0].url}
//                               alt={product.name}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <PhotoIcon className="w-12 h-12 text-gray-400" />
//                           )}
//                           {/* ✅ Show offer badge only for simple pricing */}
//                           {product.pricingType === "simple" &&
//                             isOfferLive(product) && (
//                               <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
//                                 {product.offerPercentage}% OFF
//                               </div>
//                             )}
                          
                         
//                         </div>

//                         {/* Product Info */}
//                         <div className="p-4">
//                           {/* Title & Status */}
//                           <div className="flex justify-between items-start mb-2">
//                             <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
//                               {product.name}
//                             </h3>
//                             <span
//                               className={
//                                 "inline-flex px-2 py-1 text-xs font-semibold rounded-full border whitespace-nowrap " +
//                                 getStatusColor(product.status)
//                               }
//                             >
//                               {product.status === "fewleft"
//                                 ? "Few Left"
//                                 : product.status}
//                             </span>
//                           </div>

//                           {/* Description */}
//                           <p className="text-gray-600 text-xs mb-3 line-clamp-2">
//                             {product.description}
//                           </p>

//                           {/* ✅ Price & Savings - Works for both pricing types */}
//                           <div className="flex justify-between items-center mb-3">
//                             <div className="flex flex-col">
//                               <span className="text-lg font-bold text-green-600">
//                                 {getDisplayPrice(product)}
//                               </span>
//                               {getOriginalPrice(product) && (
//                                 <span className="text-sm text-gray-500 line-through">
//                                   {getOriginalPrice(product)}
//                                 </span>
//                               )}
//                             </div>
//                             <div className="text-right">
//                               <span className="text-xs text-gray-500 block">
//                                 Stock: {product.stock}
//                               </span>
//                               {/* ✅ Show savings only for simple pricing with active offer */}
//                               {product.pricingType === "simple" &&
//                                 isOfferLive(product) && (
//                                   <span className="text-xs text-red-600 font-medium block">
//                                     Save ₹
//                                     {(
//                                       parseFloat(product.price) -
//                                       parseFloat(product.offerPrice)
//                                     ).toFixed(2)}
//                                   </span>
//                                 )}
//                             </div>
//                           </div>

//                           {/* ✅ Offer End Date Banner - Only for simple pricing */}
//                           {product.pricingType === "simple" &&
//                             isOfferLive(product) &&
//                             product.offerEndDate && (
//                               <div className="mb-3 text-xs">
//                                 <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1">
//                                   <span className="text-orange-700">
//                                     🔥 Offer ends:{" "}
//                                     {new Date(
//                                       product.offerEndDate
//                                     ).toLocaleDateString()}
//                                   </span>
//                                 </div>
//                               </div>
//                             )}

//                           {/* ✅ Pricing Type Info - Show for set pricing */}
//                           {product.pricingType === "set" && (
//                             <div className="mb-3 text-xs">
//                               <div className="bg-green-50 border border-green-200 rounded px-2 py-1">
//                                 <span className="text-green-700">
//                                   📦 {product.setPricing?.length || 0} sets
//                                   available
//                                 </span>
//                               </div>
//                             </div>
//                           )}

//                           {/* Actions */}
//                           <div className="flex space-x-2 mb-3">
//                             <Link
//                               href={"/seller/products/" + product.id + "/edit"}
//                               className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg text-center transition-colors"
//                             >
//                               <PencilIcon className="w-3 h-3 inline mr-1" />
//                               Edit
//                             </Link>
//                             <button
//                               onClick={() => {
//                                 setProductToDelete(product);
//                                 setShowDeleteModal(true);
//                               }}
//                               disabled={updatingStatus === product.id}
//                               className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
//                             >
//                               <TrashIcon className="w-3 h-3" />
//                             </button>
//                           </div>

//                           {/* Status Radios */}
//                           <div className="space-y-2">
//                             <div className="text-xs text-gray-500 mb-1">
//                               Status:
//                             </div>
//                             <div className="grid grid-cols-3 gap-1 text-xs">
//                               {["active", "fewleft", "inactive"].map(
//                                 (status) => (
//                                   <label
//                                     key={status}
//                                     className="flex items-center cursor-pointer"
//                                   >
//                                     <input
//                                       type="radio"
//                                       name={"product-status-" + product.id}
//                                       value={status}
//                                       checked={product.status === status}
//                                       onChange={() =>
//                                         updateProductStatus(product.id, status)
//                                       }
//                                       className={
//                                         "w-3 h-3 " +
//                                         (status === "active"
//                                           ? "text-green-600 focus:ring-green-500"
//                                           : status === "fewleft"
//                                           ? "text-orange-600 focus:ring-orange-500"
//                                           : "text-red-600 focus:ring-red-500") +
//                                         " focus:ring-1"
//                                       }
//                                       disabled={updatingStatus === product.id}
//                                     />
//                                     <span
//                                       className={
//                                         "ml-1 " +
//                                         (product.status === status
//                                           ? "font-medium"
//                                           : "text-gray-600")
//                                       }
//                                     >
//                                       {status === "fewleft"
//                                         ? "Few Left"
//                                         : status.charAt(0).toUpperCase() +
//                                           status.slice(1)}
//                                     </span>
//                                   </label>
//                                 )
//                               )}
//                             </div>
//                             {updatingStatus === product.id && (
//                               <div className="text-xs text-blue-600 text-center">
//                                 Updating...
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Pagination */}
//                   {totalPages > 1 && (
//                     <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
//                       <div className="text-sm text-gray-700">
//                         Showing {indexOfFirstProduct + 1} to{" "}
//                         {Math.min(indexOfLastProduct, filteredProducts.length)}{" "}
//                         of {filteredProducts.length} results
//                       </div>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() =>
//                             setCurrentPage((prev) => Math.max(prev - 1, 1))
//                           }
//                           disabled={currentPage === 1}
//                           className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           <ChevronLeftIcon className="w-4 h-4" />
//                         </button>
//                         <span className="px-3 py-2 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg">
//                           {currentPage} of {totalPages}
//                         </span>
//                         <button
//                           onClick={() =>
//                             setCurrentPage((prev) =>
//                               Math.min(prev + 1, totalPages)
//                             )
//                           }
//                           disabled={currentPage === totalPages}
//                           className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           <ChevronRightIcon className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Delete Confirmation Modal */}
//           {showDeleteModal && productToDelete && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-bold text-gray-900">
//                       Delete Product
//                     </h2>
//                     <button
//                       onClick={() => {
//                         setShowDeleteModal(false);
//                         setProductToDelete(null);
//                       }}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <XMarkIcon className="w-6 h-6" />
//                     </button>
//                   </div>

//                   <div className="mb-6">
//                     <p className="text-gray-600 mb-4">
//                       Are you sure you want to delete{" "}
//                       <strong>{productToDelete.name}</strong>? This action
//                       cannot be undone.
//                     </p>
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                       <p className="text-red-800 text-sm">
//                         ⚠️ This will permanently remove the product and all
//                         associated data.
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex space-x-3">
//                     <button
//                       onClick={() => {
//                         setShowDeleteModal(false);
//                         setProductToDelete(null);
//                       }}
//                       disabled={deleting}
//                       className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={() => deleteProduct(productToDelete.id)}
//                       disabled={deleting}
//                       className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//                     >
//                       {deleting ? "Deleting..." : "Delete Product"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
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
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { notify } from "../../lib/notifications";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SellerProducts() {
  // ============================================
  // STATE
  // ============================================
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const router = useRouter();

  const productsPerPage = 12;

  // ============================================
  // HELPERS
  // ============================================
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ FIXED: Safe price display with NaN prevention
  const getDisplayPrice = (product) => {
    try {
      // SET PRICING: Show min-max range
      if (
        product.pricingType === "set" &&
        product.setPricing &&
        product.setPricing.length > 0
      ) {
        const prices = product.setPricing
          .map((set) => {
            const p = parseFloat(set.price);
            return isNaN(p) ? 0 : p;
          })
          .filter((p) => p > 0);

        if (prices.length === 0) return "₹0.00";

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          return "₹" + minPrice.toFixed(2);
        } else {
          return "₹" + minPrice.toFixed(2) + " - ₹" + maxPrice.toFixed(2);
        }
      }
      // VARIANT PRICING: Show min-max range
      else if (
        product.pricingType === "variant" &&
        product.variants &&
        product.variants.length > 0
      ) {
        const prices = product.variants
          .map((v) => {
            const p = parseFloat(v.price);
            return isNaN(p) ? 0 : p;
          })
          .filter((p) => p > 0);

        if (prices.length === 0) return "₹0.00";

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          return "From ₹" + minPrice.toFixed(2);
        } else {
          return "₹" + minPrice.toFixed(2) + " - ₹" + maxPrice.toFixed(2);
        }
      }
      // SIMPLE PRICING: Show price or offer price
      else {
        const now = new Date();
        const start = product.offerStartDate
          ? new Date(product.offerStartDate)
          : null;
        const end = product.offerEndDate
          ? new Date(product.offerEndDate)
          : null;

        const isOfferLive =
          product.hasOffer &&
          product.offerPercentage > 0 &&
          start instanceof Date &&
          !isNaN(start.getTime()) &&
          end instanceof Date &&
          !isNaN(end.getTime()) &&
          now >= start &&
          now <= end;

        if (isOfferLive) {
          // ✅ FIX: Calculate offerPrice if missing
          let offerPrice = product.offerPrice;
          if (!offerPrice || isNaN(parseFloat(offerPrice))) {
            const basePrice = parseFloat(product.price);
            if (isNaN(basePrice)) return "₹0.00";
            offerPrice = basePrice * (1 - product.offerPercentage / 100);
          }
          const parsedOffer = parseFloat(offerPrice);
          if (isNaN(parsedOffer)) return "₹0.00";
          return "₹" + parsedOffer.toFixed(2);
        } else {
          const price = parseFloat(product.price);
          if (isNaN(price)) return "₹0.00";
          return "₹" + price.toFixed(2);
        }
      }
    } catch (error) {
      console.error("[getDisplayPrice] Error:", error, { product });
      return "₹0.00";
    }
  };

  // ✅ FIXED: Safe original price display
  const getOriginalPrice = (product) => {
    try {
      if (product.pricingType === "set" || product.pricingType === "variant") {
        return null;
      }

      const now = new Date();
      const start = product.offerStartDate
        ? new Date(product.offerStartDate)
        : null;
      const end = product.offerEndDate ? new Date(product.offerEndDate) : null;

      const isOfferLive =
        product.hasOffer &&
        product.offerPercentage > 0 &&
        start instanceof Date &&
        !isNaN(start.getTime()) &&
        end instanceof Date &&
        !isNaN(end.getTime()) &&
        now >= start &&
        now <= end;

      if (isOfferLive) {
        const price = parseFloat(product.price);
        if (isNaN(price)) return null;
        return "₹" + price.toFixed(2);
      }
      return null;
    } catch (error) {
      console.error("[getOriginalPrice] Error:", error, { product });
      return null;
    }
  };

  // ✅ FIXED: Safe offer live check
  const isOfferLive = (product) => {
    try {
      if (product.pricingType !== "simple") return false;

      const now = new Date();
      const start = product.offerStartDate
        ? new Date(product.offerStartDate)
        : null;
      const end = product.offerEndDate ? new Date(product.offerEndDate) : null;

      return (
        product.hasOffer &&
        product.offerPercentage > 0 &&
        start instanceof Date &&
        !isNaN(start.getTime()) &&
        end instanceof Date &&
        !isNaN(end.getTime()) &&
        now >= start &&
        now <= end
      );
    } catch (error) {
      console.error("[isOfferLive] Error:", error, { product });
      return false;
    }
  };

  // ✅ BADGES
  const getRatingBadge = (product) => {
    if (!product.ratings || !product.ratings.average) return null;
    const rating = product.ratings.average;

    if (rating >= 4.5) {
      return (
        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
          ⭐ {rating.toFixed(1)}
        </div>
      );
    }
    return null;
  };

  // ✅ SALES METRICS
  const getSalesMetrics = (product) => {
    if (!product.salesMetrics) return null;
    const { totalSales, totalRevenue } = product.salesMetrics;
    return { totalSales, totalRevenue };
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/seller/auth/login");
        return;
      }
      setUser(currentUser);
      await loadProducts();
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  // ✅ DEBUG: Log product offers to console
  useEffect(() => {
    products.forEach((p) => {
      if (p.hasOffer && p.offerPercentage > 0) {
        console.log("[product-offer]", {
          id: p.id,
          name: p.name,
          pricingType: p.pricingType,
          price: p.price,
          offerPrice: p.offerPrice,
          offerPercentage: p.offerPercentage,
          hasOffer: p.hasOffer,
          offerStartDate: p.offerStartDate,
          offerEndDate: p.offerEndDate,
          displayPrice: getDisplayPrice(p),
        });
      }
    });
  }, [products]);

  // ============================================
  // API CALLS
  // ============================================
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const idToken = await user.getIdToken();

      const response = await fetch("/api/products?sellerId=" + user.uid, {
        headers: {
          Authorization: "Bearer " + idToken,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const productsArray = data.data?.results || [];
          setProducts(productsArray);
        } else {
          notify.error("Failed to load products");
          setProducts([]);
        }
      } else {
        notify.error("Failed to load products");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      notify.error("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setDeleting(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const idToken = await user.getIdToken();

      const response = await fetch("/api/products/" + productId, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + idToken,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(products.filter((p) => p.id !== productId));
          setShowDeleteModal(false);
          setProductToDelete(null);
          notify.success("Product deleted successfully!");
        } else {
          throw new Error(result.error);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      notify.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const updateProductStatus = async (productId, newStatus) => {
    try {
      setUpdatingStatus(productId);
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const idToken = await user.getIdToken();

      const response = await fetch("/api/products/" + productId, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + idToken,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();

      if (result.success) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : product
          )
        );

        const statusMessages = {
          active: "Product activated!",
          inactive: "Product deactivated!",
          fewleft: "Product marked as Few Left!",
          draft: "Product moved to draft!",
        };

        notify.success(statusMessages[newStatus]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      notify.error(error.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ============================================
  // FILTER & PAGINATION
  // ============================================
  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.tags &&
            product.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // ============================================
  // DISPLAY HELPERS
  // ============================================
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-red-100 text-red-800 border-red-200",
      fewleft: "bg-orange-100 text-orange-800 border-orange-200",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Products - Seller Dashboard</title>
        <meta name="description" content="Manage your product catalog" />
      </Head>

      <SellerLayout>
        <div className="min-h-screen bg-gray-50">
          {/* HEADER */}
          <div className="bg-white shadow-sm border-b top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4 sm:py-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Product Management
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                    Manage and organize your product catalog
                  </p>
                </div>
                <Link
                  href="/seller/products/add"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Product</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* FILTERS */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="fewleft">Few Left</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm col-span-1 sm:col-span-2 lg:col-span-1"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-6">
              <StatCard
                label="Total"
                count={products.length}
                color="text-blue-600"
              />
              <StatCard
                label="Active"
                count={products.filter((p) => p.status === "active").length}
                color="text-green-600"
              />
              <StatCard
                label="Few Left"
                count={products.filter((p) => p.status === "fewleft").length}
                color="text-orange-600"
              />
              <StatCard
                label="Inactive"
                count={products.filter((p) => p.status === "inactive").length}
                color="text-red-600"
              />
              <div className="hidden sm:block lg:block">
                <StatCard
                  label="Draft"
                  count={products.filter((p) => p.status === "draft").length}
                  color="text-yellow-600"
                />
              </div>
            </div>

            {/* PRODUCTS GRID */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Products ({filteredProducts.length})
                </h2>
                <div className="text-xs sm:text-sm text-gray-600">
                  {totalPages > 0 && (
                    <>
                      Page {currentPage} of {totalPages}
                    </>
                  )}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <EmptyState
                  isEmpty={products.length === 0}
                  onAddClick={() => router.push("/seller/products/add")}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {currentProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        getStatusColor={getStatusColor}
                        getDisplayPrice={getDisplayPrice}
                        getOriginalPrice={getOriginalPrice}
                        isOfferLive={isOfferLive}
                        getRatingBadge={getRatingBadge}
                        getSalesMetrics={getSalesMetrics}
                        onEdit={() =>
                          router.push(
                            "/seller/products/" + product.id + "/edit"
                          )
                        }
                        onDelete={() => {
                          setProductToDelete(product);
                          setShowDeleteModal(true);
                        }}
                        onStatusChange={(status) =>
                          updateProductStatus(product.id, status)
                        }
                        isUpdating={updatingStatus === product.id}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      indexOfFirstProduct={indexOfFirstProduct}
                      indexOfLastProduct={indexOfLastProduct}
                      filteredProductsLength={filteredProducts.length}
                      onPreviousClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      onNextClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* DELETE MODAL */}
          {showDeleteModal && productToDelete && (
            <DeleteModal
              product={productToDelete}
              isDeleting={deleting}
              onConfirm={() => deleteProduct(productToDelete.id)}
              onCancel={() => {
                setShowDeleteModal(false);
                setProductToDelete(null);
              }}
            />
          )}

          {/* SCROLL TO TOP */}
          <button
            onClick={scrollToTop}
            className="fixed bottom-4 sm:bottom-8 right-4 w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
            aria-label="Back to top"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        </div>
      </SellerLayout>
    </>
  );
}

// ============================================
// COMPONENTS
// ============================================

function StatCard({ label, count, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 border">
      <div className="text-center">
        <p className={`text-lg sm:text-2xl font-bold ${color}`}>{count}</p>
        <p className="text-xs sm:text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ isEmpty, onAddClick }) {
  return (
    <div className="text-center py-8 sm:py-12">
      <PhotoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
        {isEmpty ? "No products yet" : "No products found"}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
        {isEmpty
          ? "Get started by creating your first product."
          : "Try adjusting your search or filter criteria."}
      </p>
      {isEmpty && (
        <button
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Your First Product</span>
        </button>
      )}
    </div>
  );
}

function ProductCard({
  product,
  getStatusColor,
  getDisplayPrice,
  getOriginalPrice,
  isOfferLive,
  getRatingBadge,
  getSalesMetrics,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdating,
}) {
  const metrics = getSalesMetrics(product);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* IMAGE */}
      <div className="aspect-square bg-gray-200 flex items-center justify-center relative overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <PhotoIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
        )}

        {/* BADGES - TOP LEFT */}
        {product.pricingType === "simple" && isOfferLive(product) && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
            {product.offerPercentage}% OFF
          </div>
        )}
      
        {/* RATING - TOP RIGHT */}
        {getRatingBadge(product)}

        {/* BADGES - BOTTOM RIGHT */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {product.badges?.isHotselling && (
            <div className="text-xs bg-red-500 text-white px-2 py-1 rounded shadow-md">
              🔥
            </div>
          )}
          {product.badges?.isTrending && (
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded shadow-md">
              📈
            </div>
          )}
          {product.badges?.isToprated && (
            <div className="text-xs bg-yellow-500 text-white px-2 py-1 rounded shadow-md">
              ⭐
            </div>
          )}
        </div>
      </div>

      {/* INFO */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col">
        {/* TITLE & STATUS */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 flex-1">
            {product.name}
          </h3>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getStatusColor(
              product.status
            )}`}
          >
            {product.status === "fewleft"
              ? "Few"
              : product.status.charAt(0).toUpperCase() +
                product.status.slice(1)}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
          {product.description}
        </p>

        {/* PRICE */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <span className="text-sm sm:text-lg font-bold text-green-600">
              {getDisplayPrice(product)}
            </span>
            {getOriginalPrice(product) && (
              <span className="text-xs text-gray-500 line-through">
                {getOriginalPrice(product)}
              </span>
            )}
          </div>
          
        </div>

        {/* SALES METRICS */}
        {metrics && (
          <div className="text-xs text-gray-600 mb-2 flex justify-between">
            <span>Sales: {metrics.totalSales}</span>
            <span>₹{metrics.totalRevenue}</span>
          </div>
        )}

        {/* TYPE INFO */}
        {product.pricingType === "set" && (
          <div className="mb-2 text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
            <span className="text-green-700">
              {product.setPricing?.length || 0} sets available
            </span>
          </div>
        )}

        {product.pricingType === "variant" && (
          <div className="mb-2 text-xs bg-purple-50 border border-purple-200 rounded px-2 py-1">
            <span className="text-purple-700">
              {product.variants?.length || 0} variants available
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-2 mb-3 mt-auto">
          <button
            onClick={onEdit}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-lg text-center transition-colors"
          >
            <PencilIcon className="w-3 h-3 inline mr-1" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>

        {/* STATUS RADIOS */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Status:</div>
          <div className="grid grid-cols-3 gap-1">
            {["active", "fewleft", "inactive"].map((status) => (
              <label key={status} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={"status-" + product.id}
                  value={status}
                  checked={product.status === status}
                  onChange={() => onStatusChange(status)}
                  disabled={isUpdating}
                  className={`w-3 h-3 ${
                    status === "active"
                      ? "text-green-600"
                      : status === "fewleft"
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                />
                <span
                  className={`ml-1 text-xs ${
                    product.status === status ? "font-medium" : "text-gray-600"
                  }`}
                >
                  {status === "fewleft" ? "FEW" : status.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
          {isUpdating && (
            <div className="text-xs text-blue-600 text-center">Updating...</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  indexOfFirstProduct,
  indexOfLastProduct,
  filteredProductsLength,
  onPreviousClick,
  onNextClick,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-0">
      <div className="text-xs sm:text-sm text-gray-700">
        Showing {indexOfFirstProduct + 1} to{" "}
        {Math.min(indexOfLastProduct, filteredProductsLength)} of{" "}
        {filteredProductsLength} results
      </div>
      <div className="flex gap-2">
        <button
          onClick={onPreviousClick}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNextClick}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ product, isDeleting, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Delete Product
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to delete <strong>{product.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-xs sm:text-sm">
                ⚠️ This will permanently remove the product and all associated
                data.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}