import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";

export default function About() {
  const today = new Date().toLocaleDateString();

  return (
    <>
      <Head>
        <title>About Us | DesiGifting</title>
        <meta
          name="description"
          content="DesiGifting is a multi-vendor marketplace powered by local Indian artists and small businesses, focused on handcrafted, made-in-India gifts."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/about" />
        <meta property="og:title" content="About Us | DesiGifting" />
        <meta
          property="og:description"
          content="Learn how DesiGifting supports local makers with a marketplace for handcrafted gifts made in India, made for India, made by India."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-emerald-700 font-semibold">
                  About DesiGifting
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">
                  Made in India. Made for India.
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  DesiGifting is a home for India’s handcrafted gifts – a
                  marketplace where local artists, craft makers, and small
                  businesses can sell unique, customized products directly to
                  customers across the country.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Building trust with artists and customers since 12/12/24
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TOC */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                On this page
              </h2>
              <nav className="space-y-2 text-sm">
                {[
                  ["#story", "1. Our Story"],
                  ["#mission", "2. Our Mission & Values"],
                  ["#artists", "3. Powered by Local Artists"],
                  ["#experience", "4. What You Can Expect"],
                  ["#trust", "5. Trust, Quality & Safety"],
                  ["#impact", "6. Impact & Vision"],
                  ["#join", "7. Join the DesiGifting Family"],
                  ["#contact", "8. Contact Us"],
                ].map(([href, label]) => (
                  <div key={href}>
                    <a
                      href={href}
                      className="text-gray-600 hover:text-emerald-700"
                    >
                      {label}
                    </a>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Body */}
          <article className="prose prose-emerald lg:prose-lg lg:col-span-8 prose-headings:scroll-mt-24">
            <h2 id="story">1. Our Story</h2>
            <p>
              DesiGifting was created with a simple idea: gifts should feel
              personal, thoughtful, and rooted in real stories – not mass
              production. We saw how many talented Indian artisans and small
              makers struggle to reach customers online, while buyers struggle
              to find genuine, handcrafted products they can trust.
            </p>
            <p>
              DesiGifting bridges this gap by bringing local creators and
              conscious buyers onto one trusted, mobile-first platform focused
              on customized and handcrafted gifts.
            </p>

            <h2 id="mission">2. Our Mission & Values</h2>
            <ul>
              <li>
                Support local makers, artists, and small businesses across India
                with fair, transparent opportunities.
              </li>
              <li>
                Make it easy for buyers to discover authentic, handcrafted,
                made-in-India gifts for every occasion.
              </li>
              <li>
                Build a trusted platform with clear policies, no fake discounts,
                and honest communication.
              </li>
            </ul>

            <h2 id="artists">3. Powered by Local Artists</h2>
            <p>
              DesiGifting is powered by independent Indian artists, home-based
              sellers, craft studios, and small brands. Every product has a
              human behind it – someone designing, handcrafting, or customizing
              it just for you.
            </p>
            <p>
              By shopping on DesiGifting, you support local livelihoods,
              regional crafts, and the spirit of{" "}
              <strong>made in India, made for India, made by India</strong>.
            </p>

            <h2 id="experience">4. What You Can Expect</h2>
            <ul>
              <li>
                Curated catalog of personalized and handcrafted gifts across
                categories like home décor, stationery, accessories, and more.
              </li>
              <li>
                Multi-vendor experience – compare different artists, styles, and
                price points in one place.
              </li>
              <li>
                Clear product details, customization options, and
                straightforward pricing without confusing gimmicks.
              </li>
            </ul>

            <h2 id="trust">5. Trust, Quality & Safety</h2>
            <ul>
              <li>
                Defined policies for shipping, returns, and payouts to protect
                both buyers and sellers.
              </li>
              <li>
                Monitoring for counterfeit or low-quality listings and action
                against misuse of the platform.
              </li>
              <li>
                Secure payments via trusted gateways and order tracking to keep
                you informed at every step.
              </li>
            </ul>

            <h2 id="impact">6. Impact & Vision</h2>
            <p>
              Beyond gifting, DesiGifting aims to become a sustainable ecosystem
              where local creators can grow into brands, and buyers can discover
              meaningful products that celebrate India’s cultures and crafts.
            </p>
            <p>
              As we grow, we plan to onboard more regional art forms, expand
              customization tools, and launch features that give artists better
              visibility and analytics.
            </p>

            <h2 id="join">7. Join the DesiGifting Family</h2>
            <p>
              Whether you are an artist, a small business owner, or someone who
              simply loves thoughtful gifts, DesiGifting is built for you.
            </p>
            <p>
              Sellers can{" "}
              <Link href="auth/seller/register">
                apply to become a DesiGifting seller
              </Link>{" "}
              and start listing their handcrafted products. Buyers can explore
              curated collections, support local talent, and make every gift
              feel special.
            </p>

            <h2 id="contact">8. Contact Us</h2>
            <p>
              Have questions, feedback, or collaboration ideas? Reach out at{" "}
              <a href="mailto:desigifting@gmail.com">
                hello@desigifting.store
              </a>{" "}
              
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
