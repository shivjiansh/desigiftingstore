import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ReturnRefundPolicy() {
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
        <title>Return & Refund Policy | DesiGifting</title>
        <meta
          name="description"
          content="DesiGifting’s Return and Refund Policy: how to request cancellations, when you’re eligible for returns & refunds, and what to expect."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/returns" />
        <meta
          property="og:title"
          content="Return & Refund Policy | DesiGifting"
        />
        <meta
          property="og:description"
          content="Learn how you can request a cancellation, when you’re eligible for a return and refund, and how we protect buyers."
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
                  Return & Refund Policy
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  Our process for cancellations, returns, and refunds—clear,
                  simple, and designed to protect both buyers and sellers on
                  DesiGifting.
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
                  ["#cancel", "2. Order Cancellation"],
                  ["#returns", "3. Returns & Refund Eligibility"],
                  ["#process", "4. How to Request a Return/Refund"],
                  ["#timing", "5. Refund Timeline"],
                  ["#exceptions", "6. Exceptions & FAQs"],
                  ["#support", "7. Need Help?"],
                  ["#changes", "8. Changes to this Policy"],
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
              DesiGifting is a multi-vendor marketplace. Each seller sets their
              own fulfillment schedule. To keep trust and clarity, we've set
              simple, fair rules for cancellation, returns, and refunds.
            </p>

            <h2 id="cancel">2. Order Cancellation</h2>
            <ul>
              <li>
                Buyers can request order cancellation directly from the "My
                Orders" page{" "}
                <strong>until the seller has confirmed the order</strong>.
              </li>
              <li>
                Once a seller confirms or begins processing the order, it can no
                longer be cancelled.
              </li>
              <li>
                Custom or personalized products may not be eligible for
                cancellation once production begins.
              </li>
            </ul>

            <h2 id="returns">3. Returns & Refund Eligibility</h2>
            <ul>
              <li>
                Returns and refunds are{" "}
                <span className="text-emerald-700 font-semibold">
                  only available if your order is delivered after the expected
                  date of arrival (EDA)
                </span>{" "}
                as shown at order details.
              </li>
              <li>
                Delivery delays due to force majeure (natural disasters,
                government restrictions, unforeseen courier delays, etc.) may
                not qualify for a return/refund.
              </li>
              <li>
                All requests are reviewed and must be submitted{" "}
                <strong>within 3 days of receiving the order</strong>.
              </li>
              <li>
                Returned items must be unused, in original packaging, and in the
                same condition as received.
              </li>
            </ul>

            <h2 id="process">4. How to Request a Return/Refund</h2>
            <ol>
              <li>
                Go to <Link href="/orders">My Orders</Link> and select the
                relevant order.
              </li>
              <li>
                If it's eligible (delivered after EDA), click “Request
                Return/Refund” and follow the onscreen steps.
              </li>
              <li>
                Upload supporting proof (e.g., delivery receipt or courier
                status screenshot showing delayed delivery date).
              </li>
              <li>
                Our team will verify the request and coordinate with the seller
                for return pickup and refund.
              </li>
            </ol>

            <h2 id="timing">5. Refund Timeline</h2>
            <ul>
              <li>
                Once approved, refunds are processed to your original payment
                method within 3–7 business days (bank/UPI timelines may vary).
              </li>
              <li>
                For COD orders, refunds are processed to your chosen bank or UPI
                account after confirmation.
              </li>
            </ul>

            <h2 id="exceptions">6. Exceptions & FAQs</h2>
            <ul>
              <li>
                Returns are not accepted for items delivered on or before the
                estimated date of arrival, or for reasons unrelated to delay
                (e.g., change of mind, sizing).
              </li>
              <li>
                Personalized or custom-made products are not eligible for
                return/refund unless defective or not as described.
              </li>
              <li>
                To report damaged or incorrect products, raise a support ticket
                within 48 hours of delivery with clear photos/videos.
              </li>
            </ul>

            <h2 id="support">7. Need Help?</h2>
            <p>
              Questions or concerns? Visit our{" "}
              <Link href="/help">Help Center</Link> or contact{" "}
              <a href="mailto:desigifting@gmail.com">desigifting@gmail.com</a>.
              For urgent issues, WhatsApp or call +91 80978 92731.
            </p>

            <h2 id="changes">8. Changes to this Policy</h2>
            <p>
              We may revise this policy from time to time. By placing an order
              after any updates, you accept the current version. Last updated:{" "}
              {today}
            </p>

            <h2 id="download">Download</h2>
            <p>
              Want a copy?{" "}
              <a
                className="text-emerald-700"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("PDF/download option coming soon.");
                }}
              >
                Download PDF
              </a>{" "}
              or request by email.
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
