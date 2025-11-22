import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ShippingPolicy() {
  const today = new Date().toLocaleDateString();
    const router = useRouter();
  
  function handleBack() {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/help");
    }
  }
  return (
    <>
      <Head>
        <title>Shipping Policy | DesiGifting</title>
        <meta
          name="description"
          content="Learn how shipping works on DesiGifting: order processing, seller responsibilities, shipping times, tracking, and support. Policy for our multi-vendor marketplace."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/shipping" />
        <meta property="og:title" content="Shipping Policy | DesiGifting" />
        <meta
          property="og:description"
          content="Shipping and delivery information for purchases on DesiGifting — order processing, tracking, timeframes, and support."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-emerald-700 font-semibold">
                  DesiGifting Legal
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">
                  Shipping Policy
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  Everything you need to know about order processing, shipping
                  timelines, tracking, and delivery on DesiGifting.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Last updated: {today}
                </div>
              </div>
              <div className="shrink-0">
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
                  ["#overview", "1. Overview"],
                  ["#processing", "2. Order Processing"],
                  ["#shipping-methods", "3. Shipping Methods"],
                  ["#tracking", "4. Tracking & Notifications"],
                  ["#delivery", "5. Delivery Timeframes"],
                  ["#charges", "6. Shipping Charges"],
                  ["#failed", "7. Failed Delivery & Returns"],
                  ["#support", "8. Shipping Support"],
                  ["#changes", "9. Changes to Policy"],
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
            <h2 id="overview">1. Overview</h2>
            <p>
              DesiGifting is a marketplace for unique and personalized gifts.
              All products are shipped directly by the individual sellers you
              purchase from. Shipping policies, timeframes, and charges may vary
              between sellers and products.
            </p>

            <h2 id="processing">2. Order Processing</h2>
            <ul>
              <li>
                Orders are confirmed and processed after payment (or, for COD,
                after placement). Sellers are responsible for packaging and
                dispatch.
              </li>
              <li>
                Processing times depend on the product and seller, and are
                usually listed on the product page. Custom or made-to-order
                items may require additional time.
              </li>
            </ul>

            <h2 id="shipping-methods">3. Shipping Methods</h2>
            <ul>
              <li>
                Sellers choose their preferred courier (such as Delhivery, Blue
                Dart, India Post, etc.) and arrange for shipping.
              </li>
              <li>
                The selected courier’s name and other details will be shared
                with you once your order has shipped.
              </li>
            </ul>

            <h2 id="tracking">4. Tracking & Notifications</h2>
            <ul>
              <li>
                After dispatch, sellers must update the order with the courier
                name and a valid tracking number.
              </li>
              <li>
                You will be notified by email, SMS, or WhatsApp with shipping
                and tracking details, and can track your package from the “My
                Orders” section.
              </li>
            </ul>

            <h2 id="delivery">5. Delivery Timeframes</h2>
            <ul>
              <li>
                Typical delivery is 2–8 business days after dispatch—actual
                times depend on your location, product type, and seller.
              </li>
              <li>
                Some items (custom or remote-area deliveries) may take longer.
                Sellers strive to ship promptly and will communicate any delays.
              </li>
            </ul>

            <h2 id="charges">6. Shipping Charges</h2>
            <ul>
              <li>
                Shipping is free for orders above a specified value (e.g.,
                ₹199). Below this threshold, a shipping charge will be shown at
                checkout.
              </li>
              <li>
                Special handling or oversized items may require extra fees,
                which will be communicated before payment.
              </li>
            </ul>

            <h2 id="failed">7. Failed Delivery & Returns</h2>
            <ul>
              <li>
                If the courier is unable to deliver (due to incorrect address,
                repeated missed attempts, etc.), the order will be returned to
                the seller.
              </li>
              <li>
                The seller will contact you to reschedule delivery or initiate a
                refund, in line with our{" "}
                <Link href="/returnandrefund">Refund Policy</Link>.
              </li>
            </ul>

            <h2 id="support">8. Shipping Support</h2>
            <p>
              For any shipping questions, delayed/lost packages, or missing
              tracking info, please contact our{" "}
              <Link href="/help">Help Center</Link> or email{" "}
              <a href="mailto:desigifting@gmail.com">desigifting@gmail.com</a>.
              For urgent queries, WhatsApp or call +91 80978 92731.
            </p>

            <h2 id="changes">9. Changes to this Shipping Policy</h2>
            <p>
              We may update this shipping policy from time to time. By placing
              an order after any update, you accept the revised version. Last
              updated: {today}
            </p>

            <h2 id="download">Download</h2>
            <p>
              Need a printable copy? You can{" "}
              <a
                className="text-emerald-700"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("PDF download coming soon.");
                }}
              >
                download a PDF
              </a>{" "}
              of this policy or contact support for more information.
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
