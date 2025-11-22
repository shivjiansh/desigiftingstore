import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header"; // Adjust if needed

export default function BuyerTerms() {
  const today = new Date().toLocaleDateString();
  const router = useRouter();

                      

  return (
    <>
      <Head>
        <title>Buyer Terms of Service | DesiGifting</title>
        <meta
          name="description"
          content="Legal terms for buyers on DesiGifting: eligibility, orders, payments, shipping, returns, privacy, and dispute resolution."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/buyer-terms" />
        <meta
          property="og:title"
          content="Buyer Terms of Service | DesiGifting"
        />
        <meta
          property="og:description"
          content="Legal terms for buyers on DesiGifting: rights, obligations, returns, refunds, data privacy, and more."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Back Button and Hero */}
        <section className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border border-emerald-100 focus:outline-none"
              aria-label="Back"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back
            </button>
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-emerald-700 font-semibold">
                  DesiGifting Legal
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">
                  Buyer Terms of Service
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  These Terms are the binding agreement between you (“Buyer”,
                  “customer”, “you”) and DesiGifting when using our marketplace.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Last updated: {today}
                </div>
              </div>
              <div className="shrink-0 mt-4 sm:mt-0">
                <Link
                  href="#download"
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Download PDF
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TOC */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                On this page
              </h2>
              <nav className="space-y-2 text-sm">
                {[
                  ["#eligibility", "1. Eligibility"],
                  ["#account", "2. Account & Security"],
                  ["#orders", "3. Orders & Acceptance"],
                  ["#payment", "4. Payments"],
                  ["#shipping", "5. Shipping & Delivery"],
                  ["#returns", "6. Cancellations, Returns & Refunds"],
                  ["#conduct", "7. Fair Use & Buyer Conduct"],
                  ["#disputes", "8. Disputes & Resolution"],
                  ["#privacy", "9. Data & Privacy"],
                  ["#changes", "10. Changes & Termination"],
                  ["#contact", "11. Contact"],
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
            <p>
              By creating an account or placing orders on DesiGifting (“we”,
              “us”, “our”), you agree to these Terms, our{" "}
              <Link href="/privacy">Privacy Policy</Link>, and other policies we
              publish.
            </p>

            <h2 id="eligibility">1. Eligibility</h2>
            <ul>
              <li>
                You must be at least 18 years old and legally capable of
                entering into binding contracts to use this service.
              </li>
              <li>
                Buyers under 18 must have parent/guardian involvement and
                approval.
              </li>
            </ul>

            <h2 id="account">2. Account & Security</h2>
            <ul>
              <li>
                You are responsible for keeping your login details secure and
                for all activity under your account.
              </li>
              <li>
                Notify us immediately if you suspect unauthorized use of your
                account.
              </li>
            </ul>

            <h2 id="orders">3. Orders & Acceptance</h2>
            <ul>
              <li>
                Orders are confirmed only after seller acceptance. DesiGifting
                and sellers reserve the right to decline/cancel any order (e.g.,
                unserviceable address, suspected fraud).
              </li>
              <li>
                Custom/personalized items may require additional time or
                information.
              </li>
              <li>
                You must review product details, shipping timelines, and seller
                ratings before confirming a purchase.
              </li>
            </ul>

            <h2 id="payment">4. Payments</h2>
            <ul>
              <li>
                You agree to promptly pay for all orders using approved payment
                methods (UPI, card, COD, etc.).
              </li>
              <li>
                Payments are securely processed; your information is protected
                as per our <Link href="/privacy">Privacy Policy</Link>.
              </li>
              <li>
                Offers/discounts are applied only if eligible at checkout.
              </li>
            </ul>

            <h2 id="shipping">5. Shipping & Delivery</h2>
            <ul>
              <li>
                Sellers handle their own shipping—delivery times and couriers
                may vary per product/seller.
              </li>
              <li>
                You will receive tracking information once shipped; delivery
                estimates are not guaranteed.
              </li>
              <li>
                See our <Link href="/shipping">Shipping Policy</Link> for
                complete details.
              </li>
            </ul>

            <h2 id="returns">6. Cancellations, Returns & Refunds</h2>
            <ul>
              <li>
                You can cancel your order before the seller confirms or
                processes it; after that, cancellations may not be possible.
              </li>
              <li>
                Returns and refunds are available only if the order is delivered
                after the expected arrival date or is not as described (as per
                marketplace policy).
              </li>
              <li>
                Raise all return/refund requests from “My Orders” as explained
                in our <Link href="/returns">Return & Refund Policy</Link>.
              </li>
            </ul>

            <h2 id="conduct">7. Fair Use & Buyer Conduct</h2>
            <ul>
              <li>
                Do not abuse or misuse the service (e.g., fake orders,
                repetitive claims, abusive communication).
              </li>
              <li>
                We may suspend, limit, or close accounts for policy violations
                or abuse.
              </li>
              <li>
                If you dispute an order, provide clear, unedited proof for
                review.
              </li>
            </ul>

            <h2 id="disputes">8. Disputes & Resolution</h2>
            <ul>
              <li>
                Contact our support for order-related issues before seeking
                external remedies.
              </li>
              <li>
                We may mediate between buyer and seller—but sellers are
                responsible for fulfillment and returns unless otherwise agreed.
              </li>
              <li>
                Where applicable, our liability is limited to the value of your
                order or statutory minimums.
              </li>
            </ul>

            <h2 id="privacy">9. Data & Privacy</h2>
            <ul>
              <li>
                Your information is managed as per our{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </li>
              <li>
                Do not misuse other users’ data for unsolicited contact or any
                unlawful purposes.
              </li>
            </ul>

            <h2 id="changes">10. Changes & Termination</h2>
            <ul>
              <li>
                We may update these Terms with notice; continued use indicates
                acceptance. Major changes will be notified on this page or by
                email.
              </li>
              <li>
                We reserve the right to terminate your access for fraud, abuse,
                or breaches of these terms.
              </li>
            </ul>

            <h2 id="contact">11. Contact</h2>
            <p>
              Questions? Visit our <Link href="/help">Help Center</Link>, or
              email{" "}
              <a href="mailto:desigifting@gmail.com">desigifting@gmail.com</a>.
              For urgent situations, WhatsApp or call +91 80978 92731.
            </p>
            <h2 id="download">Download</h2>
            <p>
              You can{" "}
              <a
                className="text-emerald-700"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("PDF/download will be available soon.");
                }}
              >
                download a PDF copy
              </a>{" "}
              for your records.
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
