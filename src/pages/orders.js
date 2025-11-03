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
      <div className="min-h-screen bg-gray-50 ">
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
                    <div className="md:flex-1">
                      <p className="text-lg font-medium text-gray-900 break-words">
                        Order #{order.orderNumber || order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 md:mt-2">
                        {formatDate(order.orderDate)} &bull;{" "}
                        {order.items[0].quantity} item
                        {order.items[0].quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4 flex-shrink-0">
                      {getStatusBadge(order.status)}
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-emerald-600 hover:underline text-sm whitespace-nowrap"
                      >
                        More Details
                      </button>
                      <button
                        onClick={() => setShowComingSoon(true)}
                        className="text-emerald-600 hover:underline text-sm whitespace-nowrap"
                      >
                        Invoice
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
                    "mailto:shivansh.jauhari@gmail.com?subject=Invoice Feature Inquiry")
                }
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Contact Dev Team
              </button>
            </div>
          </div>
        )}

        <Footer />

        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #
                  {selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Status
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Items
                  </h3>
                  <ul className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-center space-x-4"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={
                              item.images?.[0]?.url || "/images/placeholder.jpg"
                            }
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Name: {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.pricingType === "variant" && (
                              <span className="ml-0">
                              Variant: {item.selectedVariant.name}
                              </span>
                            )}
                            {item.pricingType === "set" && (
                              <span className="ml-0">
                                Set: {item.selectedSet.quantity}
                              </span>
                            )}
                          </p>

                          {/* {if(item.pricimgType === "varient")} */}
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <CustomizationsView
                  customImages={selectedOrder.customizations.customImages}
                  customText={selectedOrder.customizations.customText}
                  specialMessage={selectedOrder.customizations.specialMessage}
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Delivery Address
                  </h3>
                  <address className="not-italic text-gray-700">
                    {selectedOrder.deliveryAddress.name}
                    <br />
                    {selectedOrder.deliveryAddress.addressLine1}
                    {selectedOrder.deliveryAddress.addressLine2 && (
                      <>
                        , {selectedOrder.deliveryAddress.addressLine2}
                        <br />
                      </>
                    )}
                    {selectedOrder.deliveryAddress.city},{" "}
                    {selectedOrder.deliveryAddress.state}{" "}
                    {selectedOrder.deliveryAddress.pincode}
                    <br />
                    Phone: {selectedOrder.deliveryAddress.phone}
                  </address>
                </div>
                {(selectedOrder.customText ||
                  selectedOrder.specialMessage ||
                  selectedOrder.customImages?.length > 0 ||
                  selectedOrder.items[0].customizations?.length > 0) && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCustom(!showCustom)}
                      className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg p-3 hover:border-emerald-300 transition-colors"
                    >
                      <span className="font-medium text-gray-900">
                        Customization Details
                      </span>
                      {showCustom ? (
                        <ChevronUpIcon className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-emerald-600" />
                      )}
                    </button>
                    {showCustom && (
                      <div className="mt-4 bg-emerald-50 rounded-lg p-4 border border-emerald-100 space-y-4">
                        {selectedOrder.customText && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Custom Text:
                            </p>
                            <p className="text-gray-800">
                              {selectedOrder.customText}
                            </p>
                          </div>
                        )}
                        {selectedOrder.specialMessage && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Special Message:
                            </p>
                            <p className="text-gray-800">
                              {selectedOrder.specialMessage}
                            </p>
                          </div>
                        )}
                        {selectedOrder.customImages?.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Uploaded Images:
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedOrder.customImages.map((img) => (
                                <div
                                  key={img.id}
                                  className="w-24 h-24 border rounded-lg overflow-hidden"
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
                        {selectedOrder.items[0].customizations?.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Item Customizations:
                            </p>
                            <ul className="list-disc list-inside text-gray-800">
                              {selectedOrder.items[0].customizations.map(
                                (c, idx) => (
                                  <li key={idx}>{c}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Order Total
                  </h3>
                  <p className="text-xl font-bold text-gray-900">
                    ₹
                    {(
                      selectedOrder.orderSummary?.total ??
                      selectedOrder.totalAmount
                    )?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={closeOrderDetails}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
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
