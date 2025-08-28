import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/sellerLayout";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

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
                    #{order.id.slice(-8)}
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
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          {item.customizations &&
                            Object.keys(item.customizations).length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700">
                                  Customizations:
                                </p>
                                <div className="text-xs text-gray-600">
                                  {Object.entries(item.customizations).map(
                                    ([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
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
    </SellerLayout>
  );
}
