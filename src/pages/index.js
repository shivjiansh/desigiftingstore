import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head"; // Add this import
import Link from "next/link";
import Image from "next/image"; // Use Next.js optimized images
import Layout from "../components/common/Layout";
import ProductCard from "../components/buyer/ProductCard";
import { useProducts } from "../hooks/useProducts";
import {
  SparklesIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const { products, loadProducts, isLoading } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Add missing data arrays
  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "500+", label: "Talented Sellers" },
    { number: "50,000+", label: "Custom Products" },
    { number: "99.5%", label: "Satisfaction Rate" },
  ];

  const testimonials = [
    {
      rating: 5,
      content:
        "Found the perfect customized gift for my anniversary. The quality exceeded expectations!",
      name: "Sarah Johnson",
      role: "Happy Customer",
    },
    {
      rating: 5,
      content:
        "Amazing platform for sellers! Great support and easy to manage my custom gift business.",
      name: "Rajesh Patel",
      role: "Verified Seller",
    },
    {
      rating: 5,
      content:
        "The personalization options are incredible. Made my mom's birthday extra special!",
      name: "Emily Chen",
      role: "Gift Enthusiast",
    },
  ];

  const features = [
    {
      icon: SparklesIcon,
      title: "Unique Customization",
      description:
        "Personalize every gift with text, images, and special touches",
    },
    {
      icon: HeartIcon,
      title: "Handcrafted Quality",
      description:
        "Every item is made with love by talented artisans worldwide",
    },
    {
      icon: TruckIcon,
      title: "Fast Delivery",
      description: "Get your gifts delivered quickly with tracking included",
    },
    {
      icon: ShieldCheckIcon,
      title: "Satisfaction Guaranteed",
      description: "100% money-back guarantee on all personalized gifts",
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, 8));
    }
  }, [products]);

  // Structured data for homepage
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Desigifting",
    alternateName: "Desi Gifting",
    url: "https://desigifting.store",
    logo: "https://desigifting.store/logo.png",
    description:
      "India's premier personalized gifts marketplace connecting talented artisans with customers seeking unique, customized gifts for every occasion.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    sameAs: [
      "https://facebook.com/desigifting",
      "https://instagram.com/desigifting",
      "https://twitter.com/desigifting",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Personalized Gifts",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Custom Photo Gifts",
            category: "Personalized Products",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Customized Home Decor",
            category: "Home & Living",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "10000",
      bestRating: "5",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://desigifting.store",
      },
    ],
  };

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>
          Desigifting - India's #1 Personalized Gifts Marketplace | Custom Gifts
          Online
        </title>
        <meta
          name="title"
          content="Desigifting - India's #1 Personalized Gifts Marketplace | Custom Gifts Online"
        />
        <meta
          name="description"
          content="Discover 50,000+ unique personalized gifts from 500+ talented sellers. Create custom photo gifts, engraved items & handmade treasures. Fast delivery across India. ⭐ 10,000+ happy customers!"
        />
        <meta
          name="keywords"
          content="personalized gifts, custom gifts, photo gifts, engraved gifts, handmade gifts, personalized gifts India, custom gifts online, unique gifts, birthday gifts, anniversary gifts"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://desigifting.store/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://desigifting.store/" />
        <meta
          property="og:title"
          content="Desigifting - India's #1 Personalized Gifts Marketplace"
        />
        <meta
          property="og:description"
          content="Discover 50,000+ unique personalized gifts from 500+ talented sellers. Create custom photo gifts, engraved items & handmade treasures."
        />
        <meta
          property="og:image"
          content="https://desigifting.store/og-image.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Desigifting" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://desigifting.store/" />
        <meta
          property="twitter:title"
          content="Desigifting - India's #1 Personalized Gifts Marketplace"
        />
        <meta
          property="twitter:description"
          content="Discover 50,000+ unique personalized gifts from 500+ talented sellers. Create custom photo gifts, engraved items & handmade treasures."
        />
        <meta
          property="twitter:image"
          content="https://desigifting.store/og-image.jpg"
        />

        {/* Additional SEO Meta Tags */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.position" content="28.6139;77.2090" />
        <meta name="ICBM" content="28.6139, 77.2090" />
        <meta name="language" content="English" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      </Head>

      <Layout>
        {/* Use semantic HTML structure */}
        <main>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <header className="text-center">
                <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Premium Custom Gifts Marketplace</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Create <span className="text-primary-600">Unique Gifts</span>
                  <br />
                  That Tell Your Story
                </h1>

                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Discover thousands of customizable products from talented
                  artisans worldwide. Personalize with your photos, text, and
                  ideas to create gifts that matter.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => router.push("/products")}
                    className="btn btn-primary btn-lg w-full sm:w-auto"
                    aria-label="Browse all personalized gifts"
                  >
                    Start Shopping
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                  <button
                    onClick={() => router.push("/seller/auth/register")}
                    className="btn btn-outline btn-lg w-full sm:w-auto"
                    aria-label="Join as a seller on Desigifting"
                  >
                    Become a Seller
                  </button>
                </div>
              </header>
            </div>
          </section>

          {/* Features Section */}
          <section
            className="py-20 bg-white"
            aria-labelledby="features-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <header className="text-center mb-16">
                <h2
                  id="features-heading"
                  className="text-3xl font-bold text-gray-900 mb-4"
                >
                  Why Choose Desigifting?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We make personalized gifting simple, reliable, and magical
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <article key={index} className="text-center group">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <Icon className="h-8 w-8" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section
            className="py-20 bg-gray-50"
            aria-labelledby="featured-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <header className="text-center mb-16">
                <h2
                  id="featured-heading"
                  className="text-3xl font-bold text-gray-900 mb-4"
                >
                  Featured Products
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Discover our most popular customizable gifts
                </p>
              </header>

              {isLoading ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  aria-label="Loading products"
                >
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="hover:shadow-lg transition-shadow"
                    />
                  ))}
                </div>
              )}

              <div className="text-center">
                <Link
                  href="/products"
                  className="btn btn-primary btn-lg"
                  aria-label="View all personalized gifts"
                >
                  View All Products
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section
            className="py-20 bg-primary-600"
            aria-labelledby="stats-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 id="stats-heading" className="sr-only">
                Our Achievements
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-primary-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="py-20 bg-white"
            aria-labelledby="testimonials-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <header className="text-center mb-16">
                <h2
                  id="testimonials-heading"
                  className="text-3xl font-bold text-gray-900 mb-4"
                >
                  What Our Community Says
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join thousands of happy customers and sellers
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <article key={index} className="bg-gray-50 rounded-xl p-6">
                    <div
                      className="flex items-center mb-4"
                      aria-label={`Rating: ${testimonial.rating} out of 5 stars`}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className="h-5 w-5 text-yellow-400 fill-current"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4">
                      "{testimonial.content}"
                    </blockquote>
                    <footer>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {testimonial.role}
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Create Something Special?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Join our community of gift-givers and makers. Start your
                personalized gift journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/buyer/auth/register"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg w-full sm:w-auto"
                  aria-label="Create buyer account"
                >
                  Sign Up as Buyer
                </Link>
                <Link
                  href="/seller/auth/register"
                  className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg w-full sm:w-auto"
                  aria-label="Create seller account"
                >
                  Join as Seller
                </Link>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
}
