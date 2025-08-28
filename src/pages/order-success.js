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
  const { orderId } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wait for auth and then fetch
  useEffect(() => {
    if (!orderId) return;

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        notify.error("Please login to view your order");
        router.push("/auth/login");
        return;
      }
      fetchOrder(currentUser);
    });
    return () => unsub();
  }, [orderId]);

  const fetchOrder = async (user) => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();
      console.log("Fetch order result:", result);
      if (result.success) {
        setOrder(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Order Success | Desi Gifting</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600"></div>
          ) : order ? (
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Thank you for your order!
              </h1>
              <p className="text-gray-600 mb-4">
                Your order <span className="font-medium">#{orderId.slice(0,8)}</span> is
                now <span className="font-medium">{order.status}</span>.
              </p>
              <div className="space-y-3 text-left mb-6">
                <p>
                  <span className="font-medium">Total:</span> ₹
                  {order.totalAmount?.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Payment Method:</span>{" "}
                  {order.paymentMethod.toUpperCase()}
                </p>
                <p>
                  <span className="font-medium">Placed on:</span>{" "}
                  {new Date(order?.orderDate).toLocaleString()}
                </p>
              </div>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
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
