// // pages/orders/index.js
// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// import Link from "next/link";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../lib/firebase";
// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import { notify } from "../lib/notifications";

// export default function OrdersPage() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (!currentUser) {
//         notify.error("Please log in to view your orders");
//         router.push("/auth/login");
//       } else {
//         setUser(currentUser);
//       }
//     });
//     return () => unsubscribe();
//   }, [router]);

//   useEffect(() => {
//     if (user) loadOrders();
//   }, [user]);

//   async function loadOrders() {
//     try {
//       setLoading(true);
//       const idToken = await user.getIdToken();
//       const res = await fetch("/api/user/orders", {
//         headers: { Authorization: `Bearer ${idToken}` },
//       });
//       const result = await res.json();
//       if (result.success) {
//         setOrders(result.data.orders || result.data);
//       } else {
//         notify.error(result.error || "Failed to load orders");
//       }
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       notify.error("Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
//           <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="h-24 bg-gray-300 rounded mb-4" />
//           ))}
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Head>
//         <title>My Orders</title>
//       </Head>
//       <Header />

//       <main className="max-w-3xl mx-auto px-4 py-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

//         {orders.length === 0 ? (
//           <p className="text-gray-600">You have no orders yet.</p>
//         ) : (
//           <ul className="space-y-4">
//             {orders.map((order) => (
//               <li
//                 key={order.id}
//                 className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
//               >
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="font-medium text-gray-900">
//                       Order #{order.orderNumber || order.id}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {new Date(order.createdAt).toLocaleDateString()} •{" "}
//                       {order.items.length} item
//                       {order.items.length > 1 ? "s" : ""}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-semibold text-gray-900">
//                       ₹
//                       {order.orderSummary?.total?.toFixed(2) ||
//                         order.totalAmount?.toFixed(2)}
//                     </p>
//                     <Link href={`/orders/${order.id}`}>
//                       <a className="mt-2 inline-block text-blue-600 hover:underline text-sm">
//                         View Details →
//                       </a>
//                     </Link>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </main>

//       <Footer />
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// import Link from "next/link";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "../lib/firebase";
// import { toast } from "react-hot-toast";
// import Header from "../components/Header";
// import Footer from "../components/Footer";

// export default function MyOrders() {
//   const [user, loading] = useAuthState(auth);
//   const router = useRouter();
//   const [orders, setOrders] = useState([]);
//   const [ordersLoading, setOrdersLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showOrderDetails, setShowOrderDetails] = useState(false);

//   useEffect(() => {
//     if (!loading && !user) {
//       toast.error("Please log in to view your orders");
//       router.push("/auth/buyer/login");
//     }
//   }, [user, loading, router]);

//   useEffect(() => {
//     if (user) {
//       fetchOrders();
//     }
//   }, [user]);

//   async function fetchOrders() {
//     setOrdersLoading(true);
//     try {
//       const token = await user.getIdToken();
//       const res = await fetch(`/api/orders?userId=${user.uid}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       console.log("Fetched orders:", data.data);
//       if (data.success && Array.isArray(data.data)) {
//         setOrders(data.data);
//       } else {
//         setOrders([]);
//         toast.error(data.error || "Failed to load orders");
//       }
//     } catch {
//       setOrders([]);
//       toast.error("Failed to load orders");
//     } finally {
//       setOrdersLoading(false);
//     }
//   }

//   const getStatusBadge = (status) => {
//     const config = {
//       processing: {
//         color: "bg-yellow-100 text-yellow-800",
//         icon: "⏳",
//         label: "Processing",
//       },
//       shipped: {
//         color: "bg-blue-100 text-blue-800",
//         icon: "📦",
//         label: "Shipped",
//       },
//       "in-transit": {
//         color: "bg-indigo-100 text-indigo-800",
//         icon: "🚚",
//         label: "In Transit",
//       },
//       delivered: {
//         color: "bg-green-100 text-green-800",
//         icon: "✅",
//         label: "Delivered",
//       },
//       cancelled: {
//         color: "bg-red-100 text-red-800",
//         icon: "❌",
//         label: "Cancelled",
//       },
//     }[status] || {
//       color: "bg-gray-100 text-gray-800",
//       icon: "❔",
//       label: status,
//     };

//     return (
//       <span
//         className={`inline-flex items-center px-2 py-1 rounded ${config.color} text-sm font-medium`}
//       >
//         <span className="mr-1">{config.icon}</span>
//         {config.label}
//       </span>
//     );
//   };

//   const formatDate = (iso) =>
//     new Date(iso).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//   const viewOrderDetails = (order) => {
//     setSelectedOrder(order);
//     setShowOrderDetails(true);
//     console.log("Selectedddd order:", order);
//   };

//   const closeOrderDetails = () => {
//     setSelectedOrder(null);
//     setShowOrderDetails(false);
//   };

//   if (loading || ordersLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Header />
//         <div className="text-center p-8">
//           <div className="animate-pulse h-8 bg-gray-300 rounded w-64 mb-4 mx-auto"></div>
//           <div className="animate-pulse space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="h-24 bg-gray-300 rounded" />
//             ))}
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <>
//       <Head>
//         <title>My Orders - GiftCraft</title>
//         <meta
//           name="description"
//           content="View your order history and track deliveries"
//         />
//       </Head>
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <main className="max-w-4xl mx-auto px-4 py-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
//           {orders.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="text-6xl mb-4">📦</div>
//               <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//                 No orders yet
//               </h2>
//               <p className="text-gray-600 mb-6">
//                 Your orders will appear here. Start shopping to place your first
//                 order!
//               </p>
//               <Link
//                 href="/products"
//                 className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
//               >
//                 Start Shopping
//               </Link>
//             </div>
//           ) : (
//             <ul className="space-y-6">
//               {orders.map((order) => (
//                 <li
//                   key={order.id}
//                   className="bg-white border rounded-lg shadow-sm"
//                 >
//                   <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-center">
//                     <div>
//                       <p className="text-lg font-medium text-gray-900">
//                         Order #{order.orderNumber || order.id.slice(0, 8)}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         {formatDate(order.orderDate)} &bull;{" "}
//                         {order.items[0].quantity} item
//                         {order.items[0].quantity > 1 ? "s" : ""}
//                       </p>
//                     </div>
//                     <div className="mt-4 md:mt-0 flex items-center space-x-4">
//                       {getStatusBadge(order.status)}
//                       <button
//                         onClick={() => viewOrderDetails(order)}
//                         className="text-blue-600 hover:underline text-sm"
//                       >
//                         View Details →
//                       </button>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </main>
//         <Footer />

//         {/* Order Details Modal */}
//         {selectedOrder?.items[0]?.customizations &&
//           selectedOrder?.items[0]?.customizations.length > 0 && (
//             <div className="mt-6">
//               <button
//                 onClick={() => setShowCustom(!showCustom)}
//                 className="w-full flex justify-between items-center bg-white border rounded-lg p-3 hover:bg-gray-50 transition"
//               >
//                 <span className="font-medium text-gray-900">
//                   Customization Details
//                 </span>
//                 {showCustom ? (
//                   <ChevronUpIcon className="w-5 h-5 text-gray-600" />
//                 ) : (
//                   <ChevronDownIcon className="w-5 h-5 text-gray-600" />
//                 )}
//               </button>
//               {showCustom && (
//                 <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-4">
//                   {/* Custom Text */}
//                   {selectedOrder.customText && (
//                     <div>
//                       <p className="text-sm text-gray-600">Custom Text:</p>
//                       <p className="text-gray-800">
//                         {selectedOrder.customText}
//                       </p>
//                     </div>
//                   )}
//                   {/* Special Message */}
//                   {selectedOrder.specialMessage && (
//                     <div>
//                       <p className="text-sm text-gray-600">Special Message:</p>
//                       <p className="text-gray-800">
//                         {selectedOrder.specialMessage}
//                       </p>
//                     </div>
//                   )}
//                   {/* Uploaded Images */}
//                   {selectedOrder.customImages?.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600">Uploaded Images:</p>
//                       <div className="mt-2 flex flex-wrap gap-2">
//                         {selectedOrder.customImages.map((img) => (
//                           <div
//                             key={img.id}
//                             className="w-24 h-24 border rounded-lg overflow-hidden"
//                           >
//                             <img
//                               src={img.url}
//                               alt={img.name}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   {/* Line-by-line item customizations */}
//                   {selectedOrder.items[0].customizations?.length > 0 && (
//                     <div>
//                       <p className="text-sm text-gray-600">
//                         Item Customizations:
//                       </p>
//                       <ul className="list-disc list-inside text-gray-800">
//                         {selectedOrder.items[0].customizations.map((c, idx) => (
//                           <li key={idx}>{c}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//       </div>
//     </>
//   );
// }

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { toast } from "react-hot-toast";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MyOrders() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

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
        color: "bg-yellow-100 text-yellow-800",
        icon: "⏳",
        label: "Processing",
      },
      shipped: {
        color: "bg-blue-100 text-blue-800",
        icon: "📦",
        label: "Shipped",
      },
      "in-transit": {
        color: "bg-indigo-100 text-indigo-800",
        icon: "🚚",
        label: "In Transit",
      },
      delivered: {
        color: "bg-green-100 text-green-800",
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
    setShowCustom(false);
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
          <div className="animate-pulse h-8 bg-gray-300 rounded w-64 mb-4 mx-auto"></div>
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-gray-600 mb-6">
                Your orders will appear here. Start shopping to place your first
                order!
              </p>
              <Link
                href="/products"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
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
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Order #{order.orderNumber || order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.orderDate)} &bull;{" "}
                        {order.items[0].quantity} item
                        {order.items[0].quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                      {getStatusBadge(order.status)}
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
        <Footer />

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #
                  {selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}
                </h2>
                <button
                  onClick={closeOrderDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
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
                          <img
                            src={
                              item.images?.[0]?.url || "/images/placeholder.jpg"
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
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

                {/* Customization Details Dropdown */}
                {(selectedOrder.customText ||
                  selectedOrder.specialMessage ||
                  selectedOrder.customImages?.length > 0 ||
                  selectedOrder.items[0].customizations?.length > 0) && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCustom(!showCustom)}
                      className="w-full flex justify-between items-center bg-white border rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-gray-900">
                        Customization Details
                      </span>
                      {showCustom ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    {showCustom && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-4">
                        {/* Custom Text */}
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
                        {/* Special Message */}
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
                        {/* Uploaded Images */}
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
                        {/* Item-level customizations */}
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

                <div>
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
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
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
