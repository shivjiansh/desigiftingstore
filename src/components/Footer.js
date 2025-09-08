import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HeartIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    shop: [{ name: "All Products", href: "/products" }],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/story" },
      { name: "Contact", href: "/contact" },
    ],
    support: [{ name: "Help Center", href: "/help" }],
    seller: [{ name: "Become a Seller", href: "/seller/register" }],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Refund Policy", href: "/refunds" },
      { name: "Intellectual Property", href: "/ip" },
      { name: "Accessibility", href: "/accessibility" },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Trust Badges */}
      <div className="bg-emerald-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-900 text-sm sm:text-base mb-1 sm:mb-2">
                Secure Payments
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700">
                256-bit SSL encryption
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                <TruckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-teal-900 text-sm sm:text-base mb-1 sm:mb-2">
                Free Shipping
              </h3>
              <p className="text-xs sm:text-sm text-teal-700">
                On orders over 500 Rs
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-900 text-sm sm:text-base mb-1 sm:mb-2">
                Heartcrafted
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700">
                Made with love
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-yellow-900 text-sm sm:text-base mb-1 sm:mb-2">
                4.9★ Rating
              </h3>
              <p className="text-xs sm:text-sm text-yellow-700">
                53K+ happy customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-5 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 relative overflow-hidden rounded-lg">
                    <Image
                      src="/images/logo1.png"
                      alt="DesiGifting Logo"
                      width={100}
                      height={100}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-emerald-800 tracking-tight leading-none">
                    DesiGifting
                  </span>
                </Link>
                <p className="text-emerald-700 text-sm leading-relaxed mb-6">
                  Heartcrafted with love, personalized with care. Creating
                  meaningful gifts that celebrate your story and touch the
                  hearts of those who matter most.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-emerald-600">
                  <PhoneIcon className="h-4 w-4" />
                  <span>+91 80978 92731</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-emerald-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>desigifting@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-emerald-600">
                  <MapPinIcon className="h-4 w-4" />
                  <span>Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-emerald-700">
              <p>© 2024 DesiGifting. All rights reserved.</p>
            </div>

            {/* Social Links & Back to Top */}
            <div className="flex items-center gap-4">
              {/* Social Media */}
              

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="fixed bottom-24 right-4 w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                aria-label="Back to top"
              >
                <ArrowUpIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <br />
    </footer>
  );
}
