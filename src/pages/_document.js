import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <meta charSet="utf-8" />

          {/* Favicon - Complete Implementation */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/android-chrome-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="512x512"
            href="/android-chrome-512x512.png"
          />

          {/* Theme & Browser Configuration */}
          <meta name="theme-color" content="#059669" />
          <meta name="msapplication-TileColor" content="#059669" />
          <meta name="msapplication-config" content="/browserconfig.xml" />

          {/* Viewport & Mobile Optimization */}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
          />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Desigifting" />

          {/* Performance & Resource Hints */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="preconnect" href="https://api.cloudinary.com" />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />

          {/* SEO Meta Tags */}
          <meta
            name="robots"
            content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          />
          <meta name="googlebot" content="index, follow" />
          <meta name="bingbot" content="index, follow" />
          <meta name="author" content="Desigifting Team" />
          <meta name="publisher" content="Desigifting" />
          <meta
            name="copyright"
            content="© 2024 Desigifting. All rights reserved."
          />
          <meta name="rating" content="general" />
          <meta name="distribution" content="global" />
          <meta name="revisit-after" content="1 days" />

          {/* Open Graph (Facebook) Meta Tags */}
          <meta property="og:site_name" content="Desigifting" />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:locale:alternate" content="hi_IN" />
          <meta property="fb:app_id" content="your_facebook_app_id" />

          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@desigifting" />
          <meta name="twitter:creator" content="@desigifting" />

          {/* Business & Contact Information */}
          <meta name="contact" content="support@desigifting.store" />
          <meta
            name="category"
            content="E-commerce, Personalized Gifts, Custom Products"
          />
          <meta name="coverage" content="Worldwide" />
          <meta name="target" content="all" />
          <meta name="HandheldFriendly" content="True" />
          <meta name="MobileOptimized" content="320" />


          {/* Security Headers */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />

          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />

          {/* Search Engine Specific */}
          <meta name="format-detection" content="telephone=no" />
          <meta name="msvalidate.01" content="your_bing_verification_code" />
          <meta
            name="google-site-verification"
            content="Ai3YXJq-X5YSl_mVrFABlLlHvN8T2XhlJjSUBqXCQZg"
          />
          <meta
            name="yandex-verification"
            content="your_yandex_verification_code"
          />

          {/* PWA Manifest */}

          {/* Canonical URL - Will be overridden by individual pages */}
          <link rel="canonical" href="https://desigifting.store" />

          {/* Preload Critical Resources */}

          {/* Organization Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://desigifting.store/#organization",
                    name: "Desigifting",
                    alternateName: ["Desi Gifting", "DesigiftingStore"],
                    url: "https://desigifting.store",
                    logo: {
                      "@type": "ImageObject",
                      url: "https://desigifting.store/logo-512x512.png",
                      width: 512,
                      height: 512,
                      caption: "Desigifting Logo",
                    },
                    image: "https://desigifting.store/og-image.jpg",
                    description:
                      "Desigifting - India's premier personalized gifts marketplace. Create unique, customized gifts with our multi-vendor platform connecting talented artisans and gift creators.",
                    email: "desigifting@gmail.com",
                    address: {
                      "@type": "PostalAddress",
                      addressCountry: "IN",
                      addressRegion: "India",
                    },
                    contactPoint: {
                      "@type": "ContactPoint",
                      telephone: "+91-XXXXXXXXXX",
                      contactType: "customer service",
                      availableLanguage: ["English", "Hindi"],
                    },
                    sameAs: [
                      "https://facebook.com/desigifting",
                      "https://instagram.com/desigifting",
                      "https://twitter.com/desigifting",
                      "https://linkedin.com/company/desigifting",
                    ],
                    foundingDate: "2024",
                    founders: [
                      {
                        "@type": "Person",
                        name: "Desigifting Founder",
                      },
                    ],
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://desigifting.store/#website",
                    url: "https://desigifting.store/products",
                    name: "Desigifting - Personalized Gifts Marketplace",
                    description:
                      "Create unique, customized gifts with our multi-vendor marketplace. Connect with talented sellers and make every gift special.",
                    publisher: {
                      "@id": "https://desigifting.store/#organization",
                    },
                    potentialAction: [
                      {
                        "@type": "SearchAction",
                        target: {
                          "@type": "EntryPoint",
                          urlTemplate:
                            "https://desigifting.store/products?search={search_term_string}",
                        },
                        "query-input": "required name=search_term_string",
                      },
                    ],
                    inLanguage: "en-US",
                  },
                  {
                    "@type": "OnlineStore",
                    "@id": "https://desigifting.store/#store",
                    name: "Desigifting Online Store",
                    description:
                      "Shop personalized and custom gifts from talented artisans and creators",
                    url: "https://desigifting.store",
                    image: "https://desigifting.store/store-image.jpg",
                    priceRange: "₹50 - ₹10,000",
                    paymentAccepted: [
                      "Credit Card",
                      "Debit Card",
                      "UPI",
                      "Net Banking",
                      "Cash on Delivery",
                    ],
                    currenciesAccepted: "INR",
                    openingHours: "Mo-Su 00:00-23:59",
                    hasOfferCatalog: {
                      "@type": "OfferCatalog",
                      name: "Personalized Gifts Catalog",
                      itemListElement: [
                        {
                          "@type": "Offer",
                          itemOffered: {
                            "@type": "Product",
                            name: "Custom Mugs",
                            category: "Personalized Drinkware",
                          },
                        },
                        {
                          "@type": "Offer",
                          itemOffered: {
                            "@type": "Product",
                            name: "Photo Gifts",
                            category: "Personalized Photo Products",
                          },
                        },
                        {
                          "@type": "Offer",
                          itemOffered: {
                            "@type": "Product",
                            name: "Custom Jewelry",
                            category: "Personalized Accessories",
                          },
                        },
                      ],
                    },
                  },
                ],
              }),
            }}
          />

          {/* Breadcrumb Structured Data - Will be overridden by individual pages */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
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
              }),
            }}
          />
        </Head>
        <body className="font-sans antialiased">
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
          >
            Skip to main content
          </a>

          <Main />
          <NextScript />

          {/* Schema.org structured data for website features */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Desigifting",
                url: "https://desigifting.store/products",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web Browser",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                },
                featureList: [
                  "Custom Gift Design",
                  "Multi-vendor Marketplace",
                  "Secure Payments",
                  "Order Tracking",
                  "Customer Support",
                ],
              }),
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
