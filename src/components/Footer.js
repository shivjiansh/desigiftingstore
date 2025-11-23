import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HeartIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

// Social icons (SVGs or use packages)
const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com/desigifting",
    icon: "/icons/instagram.svg",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/desigifting",
    icon: "/icons/facebook.svg",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/desigifting",
    icon: "/icons/linkedin.svg",
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 2500);
    }
  };

  // Show back to top only after scrolling
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 200);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/products" },
      { name: "Personalized Gifts", href: "/products" },
      { name: "Best Sellers", href: "/sellers" },
      { name: "Gift Ideas", href: "/products" },
    ],
    company: [
      { name: "About Us", href: "/products" },
      { name: "Contact", href: "/products" },
      { name: "Blog", href: "/products" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Shipping Policy", href: "/shipping" },
      { name: "Returns & Refunds", href: "/returnandrefund" },
      { name: "Order Tracking", href: "/order" },
      { name: "FAQs", href: "/products" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Refund Policy", href: "/returnandrefund" },
    ],
    seller: [
      { name: "Become a Seller", href: "/seller/register" },
      { name: "Seller Login", href: "/seller/login" },
      { name: "Seller Terms", href: "/seller-terms" },
      { name: "Fees Structure", href: "/seller-fees" },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-emerald-900 text-sm">
      {/* Trust Badges */}
      

      {/* Main Footer: Mobile vertical, md+ grid */}
      <div className="py-6 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Brand/About */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <Link href="/products" className="flex items-center gap-2 mb-2">
              <Image
                src="/images/logo1.png"
                alt="DesiGifting Logo"
                width={40}
                height={40}
                className="rounded"
                style={{ objectFit: "contain" }}
              />
              <span className="text-lg font-bold text-emerald-800">
                DesiGifting
              </span>
            </Link>
            <p className="text-emerald-700 text-xs leading-tight">
              Heartcrafted with love and care. Meaningful gifts for your special
              moments.
            </p>
            <div className="flex flex-col gap-1 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <PhoneIcon className="h-4 w-4" /> +91 80978 92731
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <EnvelopeIcon className="h-4 w-4" /> desigifting@gmail.com
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <MapPinIcon className="h-4 w-4" /> Mumbai, Maharashtra
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {socials.map((soc) => (
                <Link
                  href={soc.href}
                  target="_blank"
                  aria-label={soc.name}
                  key={soc.name}
                  className="rounded-full bg-emerald-100 w-8 h-8 flex items-center justify-center hover:bg-emerald-200"
                >
                  <Image src={soc.icon} alt={soc.name} width={20} height={20} />
                </Link>
              ))}
            </div>
          </div>
          {/* Columns: Shop, Support, Seller, Legal */}
          {[
            { title: "Shop", links: footerLinks.shop },
            { title: "Support", links: footerLinks.support },
            { title: "Seller", links: footerLinks.seller },
            { title: "Legal", links: footerLinks.legal },
          ].map(({ title, links }) => (
            <div key={title} className="flex flex-col">
              <h4 className="font-medium text-emerald-900 mb-2 mt-4 md:mt-0">
                {title}
              </h4>
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-emerald-700 hover:text-teal-600 text-xs"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Newsletter */}
          <div className="mt-4 md:mt-0 flex flex-col">
            <h4 className="font-medium text-emerald-900 mb-2">Newsletter</h4>
            <form
              onSubmit={handleNewsletter}
              className="flex flex-col gap-2 w-full max-w-xs"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="border border-emerald-300 px-2 py-2 rounded text-xs w-full"
              />
              <button
                type="submit"
                className="bg-emerald-700 text-white py-2 rounded text-xs font-medium hover:bg-teal-600 transition"
              >
                Subscribe
              </button>
              {subscribed && (
                <span className="text-emerald-600 text-xs pt-1">
                  Subscribed! Thank you.
                </span>
              )}
            </form>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Image
                src="/images/ssl-badge.png"
                alt="SSL Secure"
                width={30}
                height={18}
                className="object-contain"
              />
              <Image
                src="/images/payment-visa.png"
                alt="Visa"
                width={30}
                height={18}
                className="object-contain"
              />
              <Image
                src="/images/mastercard.png"
                alt="Mastercard"
                width={30}
                height={18}
                className="object-contain"
              />
              <Image
                src="/images/payment-upi.png"
                alt="UPI"
                width={30}
                height={18}
                className="object-contain"
              />
              <Image
                src="/images/razorpayment.png"
                alt="Razorpay"
                width={30}
                height={18}
                className="object-contain"
              />
              <Image
                src="/images/ssl.png"
                alt="SSL Secure"
                width={30}
                height={18}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Footer */}
      <div className="border-t border-gray-100 pt-4 pb-8 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="text-xs text-emerald-700">
            &copy; 2024 DesiGifting. All rights reserved.
          </div>
        </div>
        {/* Back to Top */}
        {showTop && (
          <button
            onClick={scrollToTop}
            className="fixed z-50 bottom-16 right-4 w-11 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
            aria-label="Back to top"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </footer>
  );
}
