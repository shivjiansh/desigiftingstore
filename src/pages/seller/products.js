import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
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
  const router = useRouter();

  const productsPerPage = 12;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/seller/auth/login");
        return;
      }

      setUser(currentUser);
      await loadProducts(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);

 const loadProducts = async () => {
   try {
     setIsLoading(true);

     // ✅ Get authenticated user
     const user = auth.currentUser;
     if (!user) {
       throw new Error("Authentication required");
     }

     // ✅ Get auth token
     const idToken = await user.getIdToken();

     // ✅ Make authenticated request
     const response = await fetch(`/api/products?sellerId=${user?.uid}`, {
       headers: {
         Authorization: `Bearer ${idToken}`,
         "Content-Type": "application/json",
       },
     });

     if (response.ok) {
       const data = await response.json();
       console.log("🔍 API Response:", data); // Debug log

       if (data.success) {
         // ✅ Extract array from correct nested property
         const productsArray = data.data?.results || [];
         console.log("✅ Products array:", productsArray); // Debug log
         setProducts(productsArray);
       } else {
         console.error("API Error:", data.error);
         setProducts(mockProducts);
       }
     } else {
       console.error("HTTP Error:", response.status);
       setProducts(mockProducts);
     }
   } catch (error) {
     console.error("Error loading products:", error);
     setProducts(mockProducts);
   } finally {
     setIsLoading(false);
   }
 };

  const mockProducts = [
    {
      id: "PROD-001",
      name: "Custom Photo Frame",
      description: "Beautiful personalized photo frames with custom engraving",
      price: 45.99,
      category: "Home Decor",
      status: "active",
      stock: 25,
      images: ["/api/placeholder/300/300"],
      tags: ["personalized", "photo", "frame", "gift"],
      createdAt: "2025-08-15T10:00:00Z",
      updatedAt: "2025-08-20T14:30:00Z",
      totalSales: 47,
      totalRevenue: 2163.53,
    },
    {
      id: "PROD-002",
      name: "Personalized Mug",
      description: "Custom coffee mugs with names, photos, or messages",
      price: 19.99,
      category: "Drinkware",
      status: "active",
      stock: 50,
      images: ["/api/placeholder/300/300"],
      tags: ["mug", "coffee", "personalized", "gift"],
      createdAt: "2025-08-10T09:15:00Z",
      updatedAt: "2025-08-18T11:20:00Z",
      totalSales: 23,
      totalRevenue: 459.77,
    },
    {
      id: "PROD-003",
      name: "Custom T-shirt",
      description: "High-quality custom printed t-shirts with your design",
      price: 29.99,
      category: "Clothing",
      status: "active",
      stock: 100,
      images: ["/api/placeholder/300/300"],
      tags: ["tshirt", "custom", "clothing", "print"],
      createdAt: "2025-08-05T16:45:00Z",
      updatedAt: "2025-08-19T13:10:00Z",
      totalSales: 15,
      totalRevenue: 449.85,
    },
    {
      id: "PROD-004",
      name: "Engraved Keychain",
      description: "Personalized metal keychains with custom engraving",
      price: 12.99,
      category: "Accessories",
      status: "draft",
      stock: 75,
      images: ["/api/placeholder/300/300"],
      tags: ["keychain", "engraved", "metal", "accessory"],
      createdAt: "2025-08-22T08:30:00Z",
      updatedAt: "2025-08-22T08:30:00Z",
      totalSales: 0,
      totalRevenue: 0,
    },
  ];

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
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

      // Mock API call - replace with real endpoint
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        Authorization: `Bearer ${await user.getIdToken()}`,
      });

      if (response.ok) {
        // Remove from local state
        const updatedProducts = products.filter(
          (product) => product.id !== productId
        );
        setProducts(updatedProducts);
        setShowDeleteModal(false);
        setProductToDelete(null);
        alert("Product deleted successfully!");
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // Mock API call - replace with real endpoint
      const response = await fetch(`/api/seller/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        const updatedProducts = products.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        );
        setProducts(updatedProducts);
        alert(
          `Product ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully!`
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update product status. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const categories = [...new Set(products.map((product) => product.category))];

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <SellerLayout>
      <Head>
        div: ts
        <title>Products - Seller Dashboard</title>
        <meta name="description" content="Manage your product catalog" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  Product Management
                </h1>
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
                  Category
                </label>
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
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                <p className="text-sm text-gray-600">Active Products</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {products.filter((p) => p.status === "draft").length}
                </p>
                <p className="text-sm text-gray-600">Draft Products</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {products.reduce((sum, p) => sum + p.totalSales, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Sales</p>
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
                Page {currentPage} of {totalPages}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    {product.images && product.images[0].url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-green-600">
                        ₹{product.price}
                      </span>
                 
                    </div>

                  

                    {/* Actions */}
                    <div className="flex space-x-2">
                      
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
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Toggle Status */}
                    <button
                      onClick={() =>
                        toggleProductStatus(product.id, product.status)
                      }
                      className={`w-full mt-2 text-xs px-3 py-2 rounded-lg transition-colors ${
                        product.status === "active"
                          ? "bg-red-100 hover:bg-red-200 text-red-700"
                          : "bg-green-100 hover:bg-green-200 text-green-700"
                      }`}
                    >
                      {product.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstProduct + 1} to{" "}
                  {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
                  {filteredProducts.length} results
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first product.
                </p>
                <Link
                  href="/seller/products/add"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Product</span>
                </Link>
              </div>
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
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete{" "}
                    <strong>{productToDelete.name}</strong>? This action cannot
                    be undone.
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
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
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
