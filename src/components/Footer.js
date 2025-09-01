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
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
} from "@heroicons/react/24/solid";

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
    shop: [
      { name: "All Products", href: "/products" },
     
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/story" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
    ],
    seller: [
      { name: "Become a Seller", href: "/seller/register" },

    ],
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
      <div className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                Secure Payments
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                256-bit SSL encryption
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <TruckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                Free Shipping
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                On orders over 200 Rs
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <HeartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                Heartcrafted
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">Made with love</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">
                4.9★ Rating
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                50K+ happy customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 sm:py-16">
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
                  <span className="text-xl font-bold text-gray-900">
                    Desi Gifting
                  </span>
                </Link>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Creating personalized gifts that tell your story. From custom
                  mugs to handcrafted jewelry, we help you celebrate life's
                  special moments with unique, meaningful gifts.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>support@desigifting.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  <span>New York, NY 10001</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className=" border-gray-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-600">
              <p>© 2024 Desi Gifting. All rights reserved.</p>
            </div>

            {/* Social Links & Back to Top */}
            <div className="flex items-center gap-4">
              {/* Social Media */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.795 3.708 13.644 3.708 12.347c0-1.297.49-2.448 1.297-3.323.875-.807 2.026-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.807.875 1.297 2.026 1.297 3.323 0 1.297-.49 2.448-1.297 3.323-.875.807-2.026 1.297-3.323 1.297zm7.83-9.437c-.807-.807-1.958-1.297-3.255-1.297-1.297 0-2.448.49-3.255 1.297-.807.807-1.297 1.958-1.297 3.255 0 1.297.49 2.448 1.297 3.255.807.807 1.958 1.297 3.255 1.297 1.297 0 2.448-.49 3.255-1.297.807-.807 1.297-1.958 1.297-3.255 0-1.297-.49-2.448-1.297-3.255z" />
                  </svg>
                </a>
              </div>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="fixed bottom-24 right-4 w-8 h-8 bg-blue-400/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-200"
                aria-label="Back to top"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <br />
    </footer>
  );
}
