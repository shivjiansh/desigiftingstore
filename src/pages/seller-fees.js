import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function SellerFees() {
  const today = new Date().toLocaleDateString();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Seller Fees | DesiGifting</title>
        <meta
          name="description"
          content="Simple, transparent seller fees at DesiGifting. ₹299 registration, ₹20 per product listing, 5% platform commission on all orders."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/seller-fees" />
        <meta property="og:title" content="Seller Fees | DesiGifting" />
        <meta
          property="og:description"
          content="Transparent, uniform pricing for all sellers. No hidden fees, no discounts."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* HERO */}
        <section className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Back</span>
            </button>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div>
                <p className="text-blue-700 font-semibold">
                  DesiGifting for Sellers
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">
                  Simple, Transparent Pricing
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  One clear pricing structure for all sellers.{" "}
                  <span className="font-semibold text-gray-900">
                    No hidden fees, no discounts, no exceptions.
                  </span>{" "}
                  Fair and predictable from day one.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                  Last updated: 10/23/2025
                </div>
              </div>
              <div className="shrink-0">
                <Link
                  href="/seller/auth/register"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold shadow hover:bg-blue-700 transition-all"
                >
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TOC */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                On this page
              </h2>
              <nav className="space-y-2 text-sm">
                {[
                  ["#fees", "Our fees"],
                  ["#breakdown", "Fee breakdown"],
                  ["#defs", "Definitions"],
                  ["#examples", "Examples"],
                  ["#faqs", "FAQs"],
                  ["#notes", "Policy"],
                ].map(([href, label]) => (
                  <div key={href}>
                    <a
                      href={href}
                      className="text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      {label}
                    </a>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* BODY */}
          <article className="lg:col-span-8 prose prose-neutral lg:prose-lg prose-headings:scroll-mt-24">
            {/* Fees */}
            <h2 id="fees">Our Fees</h2>
            <p>
              All sellers pay the same fee structure. No exceptions, no
              early-bird discounts, no special tiers.
            </p>

            <div className="not-prose grid gap-4 my-6">
              {/* Registration Fee */}
              <div className="border border-gray-300 rounded-lg p-5 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Registration Fee
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Annual subscription to maintain your seller account
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹299<span className="text-sm text-gray-500">/year</span>
                  </span>
                </div>
              </div>

              {/* Listing Fee */}
              <div className="border border-gray-300 rounded-lg p-5 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Listing Fee
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      One-time fee per product added to your catalog
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹20<span className="text-sm text-gray-500">/product</span>
                  </span>
                </div>
              </div>

              {/* Platform Commission */}
              <div className="border border-gray-300 rounded-lg p-5 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Platform Commission
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Charged on every completed order
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    5%<span className="text-sm text-gray-500">/order</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <h2 id="breakdown">Fee Breakdown</h2>
            <div className="overflow-x-auto not-prose">
              <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                      Fee Component
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                      When Charged
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Registration
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">₹299</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      Yearly on account anniversary
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Listing
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ₹20 per product
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      When product is published
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Commission
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      5% of order value
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      On order completion
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Definitions */}
            <h2 id="defs">Definitions</h2>
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold text-gray-900">
                  Registration Fee
                </dt>
                <dd className="text-gray-600 mt-1">
                  Annual subscription of ₹299 to keep your seller account
                  active. Valid for 12 months from purchase date.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Listing Fee</dt>
                <dd className="text-gray-600 mt-1">
                  One-time charge of ₹20 when you publish a product.
                  Non-refundable. Applies per unique product listing.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">
                  Platform Commission
                </dt>
                <dd className="text-gray-600 mt-1">
                  5% of the order subtotal charged on all completed orders,
                  regardless of seller, product category, or order size.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Order Value</dt>
                <dd className="text-gray-600 mt-1">
                  Product subtotal before taxes and shipping. Commission applies
                  only to item price, not shipping or taxes.
                </dd>
              </div>
            </dl>

            {/* Examples */}
            <h2 id="examples">Pricing Examples</h2>

            <div className="not-prose space-y-4 my-6">
              {/* Example 1 */}
              <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r-lg">
                <h4 className="font-bold text-gray-900 mb-2">
                  New Seller - First Year
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • Registration: <strong>₹299</strong>
                  </li>
                  <li>
                    • List 50 products: <strong>50 × ₹20 = ₹1,000</strong>
                  </li>
                  <li>
                    • Total initial investment: <strong>₹1,299</strong>
                  </li>
                </ul>
              </div>

              {/* Example 2 */}
              <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r-lg">
                <h4 className="font-bold text-gray-900 mb-2">
                  Sales Example - Single Order
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • Customer purchase: <strong>₹1,000</strong>
                  </li>
                  <li>
                    • Platform commission (5%): <strong>₹50</strong>
                  </li>
                  <li>
                    • Your payout: <strong>₹950</strong>
                  </li>
                </ul>
              </div>

              {/* Example 3 */}
              <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r-lg">
                <h4 className="font-bold text-gray-900 mb-2">
                  Monthly Revenue Scenario
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • Total sales: <strong>₹50,000</strong>
                  </li>
                  <li>
                    • Commission (5%): <strong>₹2,500</strong>
                  </li>
                  <li>
                    • Your earnings: <strong>₹47,500</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* FAQs */}
            <h2 id="faqs">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <details className="group border border-gray-300 rounded-lg p-4 bg-white">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  When is the registration fee charged?
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  The ₹299 registration fee is charged once when you create your
                  seller account and then annually on your account anniversary
                  date.
                </p>
              </details>

              <details className="group border border-gray-300 rounded-lg p-4 bg-white">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  When do I pay the listing fee?
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  The ₹20 listing fee is charged once when you publish each
                  product to your catalog. You are not charged again for the
                  same product.
                </p>
              </details>

              <details className="group border border-gray-300 rounded-lg p-4 bg-white">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  Does the 5% commission apply to taxes or shipping?
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  No. The 5% commission applies only to the product subtotal.
                  Taxes and shipping charges are not included in the commission
                  calculation.
                </p>
              </details>

              <details className="group border border-gray-300 rounded-lg p-4 bg-white">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  When do I receive my payout?
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  Payouts are processed within 7 business days after delivery
                  confirmation. Fees are deducted from your payout before
                  transfer.
                </p>
              </details>

              <details className="group border border-gray-300 rounded-lg p-4 bg-white">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  What if my registration lapses?
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  If your annual registration expires, your seller account will
                  be suspended. You must renew by paying ₹299 to reactivate.
                </p>
              </details>

              <details className="group border border-gray-300 rounded-lg p-4 bg-white">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  Are there any other hidden fees?
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm">
                  No. We charge only three fees: registration, listing, and
                  commission. There are no hidden, category-specific, or
                  variable fees.
                </p>
              </details>
            </div>

            {/* Policy */}
            <h2 id="notes">Policy & Terms</h2>
            <ul>
              <li>
                <strong>Uniform pricing:</strong> All sellers, regardless of
                volume, category, or tenure, pay identical fees. No discounts or
                special rates.
              </li>
              <li>
                <strong>Fee changes:</strong> Any future fee changes will be
                communicated at least 30 days in advance via email.
              </li>
              <li>
                <strong>Non-refundable:</strong> Registration and listing fees
                are non-refundable. Commission is only charged on completed,
                paid orders.
              </li>
              <li>
                <strong>Account suspension:</strong> Overdue registration fees
                will result in account suspension until payment is received.
              </li>
              <li>
                <strong>Payment security:</strong> All transactions are
                processed securely. We do not store your complete payment
                information.
              </li>
            </ul>

            <div className="not-prose mt-8 p-6 bg-gray-100 border border-gray-300 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">
                Ready to get started?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Join thousands of sellers and start building your business with
                us today.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/seller/auth/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Create Seller Account
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-400 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Get in Touch
                </Link>
              </div>
            </div>

            <p className="mt-8 text-sm text-gray-600">
              See also:{" "}
              <Link
                href="/seller-terms"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Seller Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
