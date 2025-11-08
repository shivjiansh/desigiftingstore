import Head from "next/head";
import Link from "next/link";

export default function SellerFees() {
  const today = new Date().toLocaleDateString();

  return (
    <>
      <Head>
        <title>Seller Fees | DesiGifting</title>
        <meta
          name="description"
          content="Transparent seller fees at DesiGifting. Zero fees through Dec 2025. From Jan 2026: ₹199/year subscription, ₹20 per listing, and platform fee 5% for new sellers or 2% for registered sellers."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/seller-fees" />
        <meta property="og:title" content="Seller Fees | DesiGifting" />
        <meta
          property="og:description"
          content="Zero fees through Dec 2025, and simple, fair pricing from 2026 for sellers."
        />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* HERO */}
        <section className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div>
                <p className="text-emerald-700 font-semibold">
                  DesiGifting for Sellers
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">
                  Transparent, Seller‑First Pricing
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  Current with confidence: pay{" "}
                  <span className="font-semibold text-gray-900">
                    zero fees through Dec 2025
                  </span>
                  . From Jan 2026, choose a clear, predictable plan that rewards
                  early sellers.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Last updated: {today}
                </div>
              </div>
              <div className="shrink-0">
                <Link
                  href="/seller/auth/register"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-white font-semibold shadow hover:from-emerald-700 hover:to-teal-700"
                >
                  Start Selling Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TOC */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                On this page
              </h2>
              <nav className="space-y-2 text-sm">
                {[
                  ["#Current", "Current offer (till Dec 2025)"],
                  ["#from2026", "Fees from Jan 2026"],
                  ["#compare", "Comparison"],
                  ["#defs", "Definitions"],
                  ["#examples", "Examples"],
                  ["#faqs", "FAQs"],
                  ["#notes", "Policy notes"],
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

          {/* BODY */}
          <article className="lg:col-span-8 prose prose-emerald lg:prose-lg prose-headings:scroll-mt-24">
            {/* Current offer */}
            <h2 id="Current">Current offer (till Dec 2025)</h2>
            <ul>
              <li>Registration fee: ₹0</li>
              <li>Listing fee: ₹0 per product</li>
              <li>Platform (commission) fee: 0% per order</li>
            </ul>
            <p className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
              Join before 31 Dec 2025 to enjoy zero fees during the Current
              period and unlock the registered tier for 2026.
            </p>

            {/* From 2026 */}
            <h2 id="from2026">From 1 January 2026</h2>
            <ul>
              <li>Registration fee: ₹199 per year (annual subscription)</li>
              <li>Listing fee: ₹20 per product listing</li>
              <li>
                Platform (commission) fee:
                <ul>
                  <li>
                    5% per order for new sellers (first registration on/after 1
                    Jan 2026)
                  </li>
                  <li>
                    2% per order for registered sellers (onboarded by 31 Dec
                    2025 and keep subscription active)
                  </li>
                </ul>
              </li>
            </ul>

            {/* Comparison table */}
            <h2 id="compare">Comparison</h2>
            <div className="overflow-x-auto not-prose">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fee
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Through Dec 2025
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      From Jan 2026 (New)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      From Jan 2026 (Registered)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      Registration
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹0</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ₹199/year
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ₹199/year
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      Listing (per product)
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹0</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹20</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹20</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      Platform fee (commission)
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">0%</td>
                    <td className="px-4 py-3 text-sm text-gray-900">5%</td>
                    <td className="px-4 py-3 text-sm text-gray-900">2%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Definitions */}
            <h2 id="defs">Definitions</h2>
            <ul>
              <li>
                <strong>Order value</strong>: Item subtotal after seller-funded
                discounts; taxes and shipping are excluded from commission
                unless stated otherwise.
              </li>
              <li>
                <strong>New seller</strong>: Account created on/after 1 Jan 2026
                with no prior active seller subscription.
              </li>
              <li>
                <strong>Registered seller</strong>: Onboarded by 31 Dec 2025 and
                keeps annual subscription active.
              </li>
              <li>
                <strong>Listing</strong>: A distinct product page/SKU added to
                catalog (define if/when listings expire and require renewal).
              </li>
            </ul>

            {/* Examples */}
            <h2 id="examples">Examples</h2>
            <ul>
              <li>
                <strong>Nov 2025</strong>: Registration ₹0, Listing ₹0,
                Commission 0%.
              </li>
              <li>
                <strong>Feb 2026 (new seller)</strong>: Registration ₹199/year,
                Listing ₹20 per product, Commission 5%.
              </li>
              <li>
                <strong>Feb 2026 (registered seller from 2025)</strong>:
                Registration ₹199/year, Listing ₹20 per product, Commission 2%.
              </li>
            </ul>

            {/* FAQs */}
            <h2 id="faqs">FAQs</h2>
            <h3 className="!mt-4">
              How do I qualify for the 2% platform fee in 2026?
            </h3>
            <p>
              Onboard by 31 Dec 2025 and keep your ₹199/year subscription active
              from 2026 onward.
            </p>

            <h3>When is the ₹20 listing fee charged?</h3>
            <p>
              When the product listing is created (and upon renewal if listings
              expire; see your listing policy).
            </p>

            <h3>Does commission apply on shipping or taxes?</h3>
            <p>
              No. Commission applies to the item subtotal after seller-funded
              discounts unless otherwise specified.
            </p>

            <h3>How are payouts handled?</h3>
            <p>
              Payouts are made net of fees within X business days of delivery
              confirmation; temporary holds may apply for disputes or
              chargebacks.
            </p>

            {/* Policy notes */}
            <h2 id="notes">Policy notes</h2>
            <ul>
              <li>
                Fee changes are communicated with a minimum 30‑day notice unless
                required sooner by law.
              </li>
              <li>
                Lapsed subscriptions may revert the commission tier to 5% until
                renewal; consider a short grace period.
              </li>
              <li>
                We may introduce category‑specific fees later with prior notice.
              </li>
            </ul>

            <p className="mt-6">
              See also:{" "}
              <Link href="/seller-terms">Seller Terms of Service</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
