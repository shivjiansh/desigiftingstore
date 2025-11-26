import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { notify } from "../lib/notifications";

export default function OrderSuccess() {
  const router = useRouter();
  // router.query.orderId can be string | string[] | undefined
  const rawOrderId = router.query.orderId;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // single fetchOrder used by auth listener
  const fetchOrder = async (user) => {
    setLoading(true);
    const start = Date.now();
    let mounted = true;

    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      // handle non-JSON or non-200 responses gracefully
      const result = await res.json().catch((err) => {
        console.error("Failed to parse JSON:", err);
        return { success: false };
      });

      console.log("Fetch order result:", result);
      if (result?.success && mounted) {
        setOrder(result.data);
      } else {
        // If API responded but success false, clear order (keeps not-found UI)
        if (mounted) setOrder(null);
      }
    } catch (e) {
      console.error("Fetch order error:", e);
    } finally {
      // ensure at least 3 seconds of loader time
      const elapsed = Date.now() - start;
      const remaining = 3000 - elapsed;

      if (remaining > 0) {
        // guard with mounted flag to avoid setState after unmount
        const t = setTimeout(() => {
          if (mounted) setLoading(false);
        }, remaining);

        // return cleanup to clear the timeout if component unmounts quickly
        // Note: we cannot `return` from here because this is not an effect; instead handle cleanup in outer effect
        // We will rely on an outer mounted flag cleanup (see useEffect below).
      } else {
        if (mounted) setLoading(false);
      }
    }
  };

  // Auth listener: wait for auth then fetch order
  useEffect(() => {
    if (!orderId) return;

    let isMounted = true; // used to avoid setting state after unmount

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        notify.error("Please login to view your order", { duration: 3000 });
        router.push("/auth/login");
        return;
      }

      // call fetchOrder; it will handle loading and minimum-duration
      fetchOrder(currentUser);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [orderId, router]);

  return (
    <>
      <Head>
        <title>Order Success | Desi Gifting</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          {loading ? (
            // Unique gifting-themed loader (no functional change)
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center animate-fadeIn">
              {/* Gift Box Animation */}
              <div className="relative mx-auto mb-6 w-24 h-24 -translate-x-3">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-32 h-32 animate-bounce"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="loading gift box animation"
                    role="img"
                  >
                    <defs>
                      {/* Drop Shadow */}
                      <filter
                        id="dropShadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="3"
                          stdDeviation="4"
                          floodOpacity="0.28"
                        />
                      </filter>

                      {/* Box gradients */}
                      <linearGradient
                        id="boxBlueGrad"
                        x1="60"
                        y1="40"
                        x2="88"
                        y2="66"
                      >
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#1e40af" />
                      </linearGradient>

                      <linearGradient
                        id="boxBlueLight"
                        x1="55"
                        y1="35"
                        x2="88"
                        y2="42"
                      >
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>

                      {/* Ribbon gradient */}
                      <linearGradient
                        id="ribbonGoldGrad"
                        x1="73"
                        y1="40"
                        x2="73"
                        y2="66"
                      >
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>

                    {/* Soft ground shadow */}
                    <ellipse
                      cx="60"
                      cy="108"
                      rx="32"
                      ry="7"
                      fill="#000"
                      opacity="0.18"
                    />

                    {/* Center Gift Box */}
                    <g filter="url(#dropShadow)">
                      {/* LEFT FACE */}
                      <path
                        d="M 60 40 L 54 48 L 54 74 L 60 66 Z"
                        fill="#0a5fbf"
                        opacity="0.82"
                      />

                      {/* FRONT FACE */}
                      <rect
                        x="60"
                        y="40"
                        width="32"
                        height="34"
                        rx="4"
                        fill="url(#boxBlueGrad)"
                      />

                      {/* TOP FACE */}
                      <path
                        d="M 60 40 L 54 34 L 92 34 L 96 40 Z"
                        fill="url(#boxBlueLight)"
                        opacity="0.95"
                      />

                      {/* VERTICAL RIBBON */}
                      <rect
                        x="75"
                        y="40"
                        width="3.5"
                        height="34"
                        fill="url(#ribbonGoldGrad)"
                      />

                      {/* HORIZONTAL RIBBON */}
                      <rect
                        x="60"
                        y="54"
                        width="32"
                        height="3.4"
                        fill="url(#ribbonGoldGrad)"
                        opacity="0.95"
                      />

                      {/* BOW LEFT */}
                      <path
                        d="M 76 40 Q 70 22 62 40"
                        fill="url(#ribbonGoldGrad)"
                        opacity="0.9"
                        stroke="rgba(251,191,36,0.5)"
                        strokeWidth="1.2"
                      />

                      {/* BOW RIGHT */}
                      <path
                        d="M 76 40 Q 82 22 90 40"
                        fill="url(#ribbonGoldGrad)"
                        opacity="0.9"
                        stroke="rgba(251,191,36,0.5)"
                        strokeWidth="1.2"
                      />

                      {/* Highlight */}
                      <ellipse
                        cx="72"
                        cy="36"
                        rx="8.5"
                        ry="4"
                        fill="white"
                        opacity="0.35"
                      />
                    </g>
                  </svg>
                </div>
              </div>

              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Placing Your Personalised Order
              </h1>
              <p className="text-gray-600 text-sm">
                We're placing your order with extra care. This will only take a
                moment.
              </p>
            </div>
          ) : order ? (
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-8 max-w-sm w-full mx-auto text-center border border-gray-100">
              {/* Success badge */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
                <CheckCircleIcon className="w-9 h-9 text-emerald-600" />
              </div>

              {/* Title */}
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
                Order Placed Successfully
              </h1>

              {/* Short message */}
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                Thank you for shopping with us.<br></br> your personalised order{" "}
                <span className="font-semibold text-gray-900 whitespace-nowrap">
                  DG-{orderId?.slice(0, 8)}
                </span>{" "}
                is now{" "}
                <span className="font-semibold text-emerald-600">
                  Placed Successfully
                </span>
                .
              </p>

              {/* Compact details panel */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 text-left mb-4">
                <div className="flex justify-between items-center text-sm sm:text-base text-gray-700 py-2">
                  <span className="truncate">Total</span>
                  <span className="font-medium">
                    ₹{order.totalAmount?.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm sm:text-base text-gray-700 py-2">
                  <span className="truncate">Payment</span>
                  <span className="font-medium">
                    {order.paymentMethod?.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm sm:text-base text-gray-700 py-2">
                  <span className="truncate">Placed on</span>
                  <span className="font-medium">
                    {new Date(order?.orderDate).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action buttons - stacked on mobile, side-by-side on md+ */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Link
                  href="/orders"
                  className="block w-full text-center bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  aria-label="View order details"
                  role="button"
                >
                  View Order
                </Link>

                <Link
                  href="/products"
                  className="block w-full text-center bg-white border border-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
                  aria-label="Continue shopping"
                  role="button"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Lightweight footer note for mobile */}
              <p className="text-xs text-gray-400 mt-4">
                You will receive an order confirmation by email shortly.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
              <XMarkIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Order Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn’t find an order with ID{" "}
                <span className="font-medium">{orderId}</span>.
              </p>
              <Link
                href="/products"
                className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
              >
                Go to Home
              </Link>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
