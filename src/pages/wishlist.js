import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import {
  HeartIcon as HeartOutline,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        fetchWishlist();
      }
    });
    return unsubscribe;
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const idToken = await user.getIdToken();
      const res = await fetch("/api/user/wishlist", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const result = await res.json();
      if (result.success) {
        setWishlist(result.data.products || []);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const user = auth.currentUser;
      const idToken = await user.getIdToken();
      const res = await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
      const result = await res.json();
      if (result.success) {
        setWishlist((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Wishlist - Desi Gifting</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Wishlist</h1>

          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <HeartOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600">
                Browse products and add your favorites to your wishlist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from wishlist"
                  >
                    <HeartOutline className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
