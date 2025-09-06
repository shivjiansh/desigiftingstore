import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { notify } from "../../lib/notifications";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SellerProducts() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const router = useRouter();

  const productsPerPage = 12;

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
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error("Authentication required");
      }

      const idToken = await user.getIdToken();

      const response = await fetch(`/api/products?sellerId=${user.uid}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 API Response:", data);

        if (data.success) {
          const productsArray = data.data?.results || [];
          console.log("✅ Products array:", productsArray);
          setProducts(productsArray);
        } else {
          console.error("API Error:", data.error);
          notify.error("Failed to load products");
          setProducts([]);
        }
      } else {
        const errorData = await response.json();
        console.error("HTTP Error:", response.status, errorData);
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

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const deleteProduct = async (productId) => {
    try {
      setDeleting(true);

      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const idToken = await user.getIdToken();

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove from local state
          const updatedProducts = products.filter(
            (product) => product.id !== productId
          );
          setProducts(updatedProducts);
          setShowDeleteModal(false);
          setProductToDelete(null);
          notify.success("Product deleted successfully!");
        } else {
          throw new Error(result.error || "Failed to delete product");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      notify.error(error.message || "Failed to delete product");
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

      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      const result = await response.json();

      if (result.success) {
        // Update local state optimistically
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

        // Show appropriate success message
        const statusMessages = {
          active: "Product activated successfully!",
          inactive: "Product deactivated successfully!",
          fewleft: 'Product marked as "Few Left" successfully!',
          draft: "Product moved to draft successfully!",
        };

        notify.success(statusMessages[newStatus]);
      } else {
        throw new Error(result.error || "Failed to update product status");
      }
    } catch (error) {
      console.error("Error updating product status:", error);

      notify.error(
        error.message === "Authentication required"
          ? "Please log in to continue"
          : error.message || "Failed to update product status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "fewleft":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get unique categories from products
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].filter(Boolean);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-1">
                    Product Management
                  </h1>
                  <p className="text-gray-600">
                    Manage and organize your product catalog
                  </p>
                </div>
                <Link
                  href="/seller/products/add"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Product</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Products
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, description, or tags..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="fewleft">Few Left</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Products Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {products.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Products</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter((p) => p.status === "active").length}
                  </p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {products.filter((p) => p.status === "fewleft").length}
                  </p>
                  <p className="text-sm text-gray-600">Few Left</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter((p) => p.status === "inactive").length}
                  </p>
                  <p className="text-sm text-gray-600">Inactive</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {products.filter((p) => p.status === "draft").length}
                  </p>
                  <p className="text-sm text-gray-600">Draft</p>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products ({filteredProducts.length})
                </h2>
                <div className="text-sm text-gray-600">
                  {totalPages > 0 && (
                    <>
                      Page {currentPage} of {totalPages}
                    </>
                  )}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {products.length === 0
                      ? "No products yet"
                      : "No products found"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {products.length === 0
                      ? "Get started by creating your first product."
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {products.length === 0 && (
                    <Link
                      href="/seller/products/add"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Your First Product</span>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentProducts.map((product) => {
                      // Compute whether the offer is currently active
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
                        end instanceof Date &&
                        now >= start &&
                        now <= end;

                      return (
                        <div
                          key={product.id}
                          className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Product Image with Offer Badge */}
                          <div className="aspect-square bg-gray-200 flex items-center justify-center relative">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <PhotoIcon className="w-12 h-12 text-gray-400" />
                            )}
                            {isOfferLive && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                {product.offerPercentage}% OFF
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            {/* Title & Status */}
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
                                {product.name}
                              </h3>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getStatusColor(
                                  product.status
                                )}`}
                              >
                                {product.status === "fewleft"
                                  ? "Few Left"
                                  : product.status}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                              {product.description}
                            </p>

                            {/* Price & Savings */}
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex flex-col">
                                {isOfferLive ? (
                                  <>
                                    <span className="text-lg font-bold text-green-600">
                                      ₹{product.offerPrice}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{product.price}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-green-600">
                                    ₹{product.price}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500 block">
                                  Stock: {product.stock}
                                </span>
                                {isOfferLive && (
                                  <span className="text-xs text-red-600 font-medium block">
                                    Save ₹
                                    {(
                                      parseFloat(product.price) -
                                      parseFloat(product.offerPrice)
                                    ).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Offer End Date Banner */}
                            {isOfferLive && (
                              <div className="mb-3 text-xs">
                                <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1">
                                  <span className="text-orange-700">
                                    🔥 Offer ends: {end.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-2 mb-3">
                              <Link
                                href={`/seller/products/${product.id}/edit`}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg text-center transition-colors"
                              >
                                <PencilIcon className="w-3 h-3 inline mr-1" />
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  setProductToDelete(product);
                                  setShowDeleteModal(true);
                                }}
                                disabled={updatingStatus === product.id}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Status Radios */}
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500 mb-1">
                                Status:
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-xs">
                                {["active", "fewleft", "inactive"].map(
                                  (status) => (
                                    <label
                                      key={status}
                                      className="flex items-center cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name={`product-status-${product.id}`}
                                        value={status}
                                        checked={product.status === status}
                                        onChange={() =>
                                          updateProductStatus(
                                            product.id,
                                            status
                                          )
                                        }
                                        className={`w-3 h-3 ${
                                          status === "active"
                                            ? "text-green-600 focus:ring-green-500"
                                            : status === "fewleft"
                                            ? "text-orange-600 focus:ring-orange-500"
                                            : "text-red-600 focus:ring-red-500"
                                        } focus:ring-1`}
                                        disabled={updatingStatus === product.id}
                                      />
                                      <span
                                        className={`ml-1 ${
                                          product.status === status
                                            ? "font-medium"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {status === "fewleft"
                                          ? "Few Left"
                                          : status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                              {updatingStatus === product.id && (
                                <div className="text-xs text-blue-600 text-center">
                                  Updating...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Showing {indexOfFirstProduct + 1} to{" "}
                        {Math.min(indexOfLastProduct, filteredProducts.length)}{" "}
                        of {filteredProducts.length} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg">
                          {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && productToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Delete Product
                    </h2>
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setProductToDelete(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to delete{" "}
                      <strong>{productToDelete.name}</strong>? This action
                      cannot be undone.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">
                        ⚠️ This will permanently remove the product and all
                        associated data.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setProductToDelete(null);
                      }}
                      disabled={deleting}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteProduct(productToDelete.id)}
                      disabled={deleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete Product"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SellerLayout>
    </>
  );
}
