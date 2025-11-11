import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { toast } from "react-hot-toast";
import {
  ChevronUpIcon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  TruckIcon,
  CalendarIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";

function CustomizationsView({
  customImages = [],
  customText = "",
  specialMessage = "",
}) {
  const [open, setOpen] = useState(false);
  if (!customImages.length && !customText && !specialMessage) return null;
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-gray-800 font-medium"
      >
        <span>View Customizations</span>
        {open ? (
          <ChevronUpIcon className="w-5 h-5 text-emerald-600" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-emerald-600" />
        )}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          {customText && (
            <div>
              <p className="text-sm text-gray-600 font-medium">Custom Text:</p>
              <p className="text-sm text-gray-800">{customText}</p>
            </div>
          )}
          {specialMessage && (
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Special Message:
              </p>
              <p className="text-sm text-gray-800">{specialMessage}</p>
            </div>
          )}
          {customImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Uploaded Images:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {customImages.map((img) => (
                  <div
                    key={img.id}
                    className="w-20 h-20 border rounded-lg overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
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

export default function MyOrders() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to view your orders");
      router.push("/auth/buyer/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  async function fetchOrders() {
    setOrdersLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/orders?userId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
        toast.error(data.error || "Failed to load orders");
      }
    } catch {
      setOrders([]);
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    const cfg = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: "⏱️",
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800",
        icon: "✓",
        label: "Confirmed",
      },
      processing: {
        color: "bg-emerald-100 text-emerald-800",
        icon: "⏳",
        label: "Processing",
      },
      shipped: {
        color: "bg-teal-100 text-teal-800",
        icon: "📦",
        label: "Shipped",
      },
      "in-transit": {
        color: "bg-teal-100 text-teal-800",
        icon: "🚚",
        label: "In Transit",
      },
      delivered: {
        color: "bg-emerald-100 text-emerald-800",
        icon: "✅",
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: "❌",
        label: "Cancelled",
      },
    }[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: "❔",
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded ${cfg.color} text-sm font-medium`}
      >
        <span className="mr-1">{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getCarrierTrackingUrl = (carrier, trackingId) => {
    const urls = {
      shiprocket: `https://shiprocket.co/tracking/${trackingId}`,
      delhivery: `https://www.delhivery.com/track/package/${trackingId}`,
      bluedart: `https://www.bluedart.com/tracking/${trackingId}`,
      fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingId}`,
      ups: `https://www.ups.com/track?tracknum=${trackingId}`,
    };
    return urls[carrier] || `https://www.google.com/search?q=${trackingId}`;
  };
  const hasMessage = (msg) => typeof msg === "string" && msg.trim().length > 0;

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    setShowCustom(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  if (loading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse h-8 bg-emerald-200 rounded w-64 mb-4 mx-auto"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders - DesiGifting</title>
        <meta
          name="description"
          content="View your order history and track deliveries"
        />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your orders will appear here. Start shopping to place your first
                order!
              </p>
              <Link
                href="/products"
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="bg-white border rounded-lg shadow-sm"
                >
                  <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-center">
                    {/* Left: Order summary */}
                    <div className="md:flex-1">
                      <p className="text-lg font-semibold text-gray-900 break-words">
                        Order #{order.orderNumber || order.id.slice(0, 8)}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          {order.items?.[0]?.name || "Item"}
                        </span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span>
                          Placed:{" "}
                          {formatDate(order.createdAt || order.orderDate)}
                        </span>
                        {order.expectedDelivery && (
                          <>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>
                              ETA: {formatDate(order.expectedDelivery)}
                            </span>
                          </>
                        )}
                        <span className="mx-2 text-gray-300">|</span>
                        <span>
                          Qty:{" "}
                          {order.items?.reduce(
                            (sum, it) => sum + (it.quantity || 0),
                            0
                          ) || 0}
                        </span>
                      </p>
                    </div>

                    {/* Right: Actions */}
                    <div className="mt-4 md:mt-0 flex items-center gap-4 flex-shrink-0">
                      {getStatusBadge(order.status)}
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-emerald-600 hover:text-emerald-700 hover:underline text-sm whitespace-nowrap font-medium"
                      >
                        More Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>

        {showComingSoon && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white/50 rounded-2xl max-w-sm w-full p-8 shadow-xl">
              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Coming Soon!
              </h3>
              <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
                Invoice download functionality is under development and will be
                available shortly. Thank you for your patience!
              </p>
              <button
                onClick={() =>
                  (window.location.href =
                    "mailto:support@desigifting.com?subject=Invoice Feature Inquiry")
                }
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}

        <Footer />

        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeOrderDetails}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Order #
                    {selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Placed on{" "}
                    {formatDate(
                      selectedOrder.createdAt || selectedOrder.orderDate
                    )}
                  </p>
                </div>
                <button
                  onClick={closeOrderDetails}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                  aria-label="Close order details"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                {/* Status Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Current status
                    </p>
                    <div className="mt-2">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                  <div className="hidden sm:block text-4xl">📋</div>
                </div>

                {/* Shipping & Delivery */}
                {(selectedOrder.trackingId ||
                  selectedOrder.expectedDelivery ||
                  selectedOrder.buyerMessage ||
                  selectedOrder.carrier) && (
                  <section>
                    <div className="flex items-center mb-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center mr-3">
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 7a2 2 0 012-2h9a2 2 0 012 2v1h1.586A2 2 0 0119 8.586L21.414 11A2 2 0 0122 12.414V17a2 2 0 01-2 2h-1a3 3 0 01-6 0H8a3 3 0 01-6 0H2a1 1 0 01-1-1v-1h1v-8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Shipping & Delivery
                      </h3>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-200/60 p-4 sm:p-5 space-y-4">
                      {/* Carrier + Tracking */}
                      {selectedOrder.carrier && selectedOrder.trackingId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-lg border border-gray-100 p-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Carrier
                            </p>
                            <p className="text-gray-900 font-semibold capitalize mt-1.5">
                              {selectedOrder.carrier}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 p-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Tracking ID
                            </p>
                            <p className="text-gray-900 font-mono font-semibold mt-1.5 break-all">
                              {selectedOrder.trackingId}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <a
                              href={getCarrierTrackingUrl(
                                selectedOrder.carrier,
                                selectedOrder.trackingId
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                            >
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Track your package
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Expected Delivery */}
                      {selectedOrder.expectedDelivery && (
                        <div className="rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Expected delivery
                            </p>
                            <p className="text-gray-900 font-semibold mt-1.5">
                              {formatDate(selectedOrder.expectedDelivery)}
                            </p>
                          </div>
                          <CalendarIcon className="w-8 h-8 text-emerald-400/70" />
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Items */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Items
                  </h3>
                  <ul className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition"
                      >
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <Image
                            src={
                              item.images?.[0]?.url || "/images/placeholder.jpg"
                            }
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </p>
                          {item.pricingType === "variant" && (
                            <p className="text-xs text-gray-600">
                              Variant: {item.selectedVariant?.name}
                            </p>
                          )}
                          {item.pricingType === "set" && (
                            <p className="text-xs text-gray-600">
                              Set: {item.selectedSet?.quantity} pcs
                            </p>
                          )}
                          <p className="text-xs text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-emerald-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Customizations */}
                <section>
                  <CustomizationsView
                    customImages={
                      selectedOrder.customizations?.customImages || []
                    }
                    customText={selectedOrder.customizations?.customText || ""}
                    specialMessage={
                      selectedOrder.customizations?.specialMessage || ""
                    }
                  />
                </section>

                {/* Delivery Address */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Delivery Address
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <address className="not-italic text-gray-700 leading-relaxed text-sm">
                      <p className="font-semibold">
                        {selectedOrder.deliveryAddress?.name}
                      </p>
                      <p>{selectedOrder.deliveryAddress?.addressLine1}</p>
                      {selectedOrder.deliveryAddress?.addressLine2 && (
                        <p>{selectedOrder.deliveryAddress?.addressLine2}</p>
                      )}
                      <p>
                        {selectedOrder.deliveryAddress?.city},{" "}
                        {selectedOrder.deliveryAddress?.state}{" "}
                        {selectedOrder.deliveryAddress?.pincode}
                      </p>
                      <p className="mt-2">
                        📞 {selectedOrder.deliveryAddress?.phone}
                      </p>
                    </address>
                  </div>
                </section>

                {/* Order Total */}
                <section>
                  <div className="rounded-xl p-4 border border-emerald-200 bg-emerald-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                      Order Total
                    </h3>
                    <p className="text-2xl font-bold text-emerald-700">
                      ₹
                      {(
                        selectedOrder.orderSummary?.total ??
                        selectedOrder.totalAmount
                      )?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment Method: {selectedOrder.paymentMethod || "N/A"}
                    </p>
                  </div>
                </section>

                {/* Message from Seller */}
                {hasMessage(selectedOrder.buyerMessage) && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Message from Seller
                    </h3>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                      <p className="text-gray-800 italic text-center">
                        "{selectedOrder.buyerMessage}"
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur border-t px-6 py-3 flex justify-end">
                <button
                  onClick={closeOrderDetails}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
