import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

// CustomizationsView Component
function CustomizationsView({
  customImages = [],
  customText = "",
  specialMessage = "",
}) {
  const [open, setOpen] = useState(false);

  // Download function for images
  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  // Don't render if no customizations
  if (!customImages.length && !customText && !specialMessage) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-gray-800 font-medium hover:text-gray-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>📝</span>
          <span>View Customizations</span>
          {(customImages.length > 0 || customText || specialMessage) && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {[
                customImages.length > 0 &&
                  `${customImages.length} image${
                    customImages.length > 1 ? "s" : ""
                  }`,
                customText && "text",
                specialMessage && "message",
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Custom Text */}
          {customText && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>✏️</span>
                Custom Text:
              </p>
              <p className="text-gray-800 break-words bg-white p-2 rounded border">
                {customText}
              </p>
            </div>
          )}

          {/* Special Message */}
          {specialMessage && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>💬</span>
                Special Message:
              </p>
              <p className="text-gray-800 break-words bg-white p-2 rounded border">
                {specialMessage}
              </p>
            </div>
          )}

          {/* Custom Images with Download */}
          {customImages.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span>📷</span>
                Uploaded Images ({customImages.length}):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {customImages.map((img, index) => (
                  <div key={img.id || index} className="relative group">
                    {/* Image Display */}
                    <div className="w-full h-20 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100 relative">
                      <img
                        src={img.url}
                        alt={img.name || `Custom image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(img.url, "_blank")}
                      />

                      {/* Download Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(
                            img.url,
                            img.name || `image-${index + 1}.jpg`
                          );
                        }}
                        className="absolute top-1 right-1 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download image"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Image Info & Download Button */}
                    <div className="mt-2 flex items-center justify-between">
                      
                      <button
                        onClick={() =>
                          downloadImage(
                            img.url,
                            img.name || `image-${index + 1}.jpg`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                        title="Download image"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function SellerOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "processing",
      label: "Processing",
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      value: "shipped",
      label: "Shipped",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/seller/auth/login");
      setUser(u);
      await fetchOrders(u.uid);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    let tmp = orders;
    if (search) {
      const q = search.toLowerCase();
      tmp = tmp.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.deliveryAddress?.name?.toLowerCase().includes(q) ||
          o.deliveryAddress?.email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      tmp = tmp.filter((o) => o.status === statusFilter);
    }
    setFiltered(tmp);
    setPage(1);
  }, [orders, search, statusFilter]);

  const fetchOrders = async (sellerId) => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/orders?sellerId=${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { success, data } = await res.json();
      console.log("Fetched orders:", data);
      if (success) setOrders(data || []);
    } catch {
      toast.error("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const result = await res.json();
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
        if (selected?.id === id) {
          setSelected({ ...selected, status: newStatus });
        }
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <Head>
        <title>Orders - Seller Dashboard</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Orders Management
            </h1>
            <p className="text-gray-600">Manage and track your orders</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {filtered.length} orders
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center w-full sm:w-1/2 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 z-10" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              className="pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    #{order.id.slice(8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.deliveryAddress?.name || "Customer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.deliveryAddress?.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Items: {order.items?.length || 0}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    ₹
                    {order.orderSummary?.total?.toFixed(2) ||
                      order.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Status Update Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Update Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value)
                    }
                    disabled={updating}
                    className="w-full text-sm px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelected(order);
                      setModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {paged.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here when customers place them"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {modalOpen && selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Order #{selected.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Status */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Order Status
                  </h4>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        selected.status
                      )}`}
                    >
                      {selected.status}
                    </span>
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        updateOrderStatus(selected.id, e.target.value)
                      }
                      disabled={updating}
                      className="px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selected.deliveryAddress?.name}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selected.deliveryAddress?.phone}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selected.userId}
                    </p>
                    <div>
                      <span className="font-medium">Address:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selected.deliveryAddress?.addressLine1}
                        <br />
                        {selected.deliveryAddress?.addressLine2 &&
                          `${selected.deliveryAddress.addressLine2}, `}
                        {selected.deliveryAddress?.city},{" "}
                        {selected.deliveryAddress?.state} -{" "}
                        {selected.deliveryAddress?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selected.items?.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Customizations View */}
                        <CustomizationsView
                          customImages={
                            selected.customizations?.customImages || []
                          }
                          customText={selected.customizations?.customText || ""}
                          specialMessage={
                            selected.customizations?.specialMessage || ""
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Order Summary
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total Amount:</span>
                      <span>
                        ₹
                        {selected.orderSummary?.total?.toFixed(2) ||
                          selected.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment Method: {selected.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-4 w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
        aria-label="Back to top"
      >
        <ArrowUpIcon className="h-5 w-5" />
      </button>
    </SellerLayout>
  );
}
