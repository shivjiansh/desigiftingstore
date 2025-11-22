import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function SellerTerms() {
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
        <title>Seller Terms of Service | DesiGifting</title>
        <meta
          name="description"
          content="Legal terms governing sellers’ use of the DesiGifting marketplace: eligibility, listings, orders, pricing, fees, payments, shipping, returns, compliance, IP, and disputes."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/seller-terms" />
        <meta
          property="og:title"
          content="Seller Terms of Service | DesiGifting"
        />
        <meta
          property="og:description"
          content="Legal terms for sellers on DesiGifting, including policies on listings, orders, fees, payouts, and dispute resolution."
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-emerald-700 font-semibold">
                  DesiGifting Legal
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">
                  Seller Terms of Service
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  These Terms form a binding contract between you and
                  DesiGifting when you offer goods through our marketplace.
                  Please read them carefully.
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
                  ["#eligibility", "1. Eligibility and Account"],
                  ["#listings", "2. Listings and Content"],
                  ["#orders", "3. Orders & Shipping"],
                  ["#pricing", "4. Pricing, Fees & Payments"],
                  ["#returns", "5. Returns & Refunds"],
                  ["#compliance", "6. Compliance & Conduct"],
                  ["#ip", "7. Intellectual Property"],
                  ["#privacy", "8. Data & Privacy"],
                  ["#disputes", "9. Disputes & Liability"],
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
              By creating or using a seller account on DesiGifting (“we”, “us”,
              “our”), you agree to these Terms, our{" "}
              <Link href="/privacy">Privacy Policy</Link>, and other policies we
              publish.
            </p>

            <h2 id="eligibility">1. Eligibility and Account</h2>
            <ul>
              <li>
                Provide accurate business, tax, and contact details; keep them
                current.
              </li>
              <li>
                Safeguard your credentials; activities under your account are
                your responsibility.
              </li>
              <li>
                We may verify identity, request documents, or suspend access for
                suspected violations.
              </li>
            </ul>

            <h2 id="listings">2. Listings and Content</h2>
            <ul>
              <li>
                Accurate titles, images, pricing, availability, and
                descriptions; no misleading claims.
              </li>
              <li>
                No prohibited or restricted items; comply with law and platform
                rules.
              </li>
              <li>
                You grant us a limited license to host, display, and promote
                your content on our services.
              </li>
            </ul>

            <h2 id="orders">3. Orders & Shipping</h2>
            <ul>
              <li>
                Ship within stated processing times; provide valid tracking when
                applicable.
              </li>
              <li>
                Use suitable packaging and comply with carrier/customs
                requirements.
              </li>
              <li>
                Communicate promptly about delays, customizations, or issues.
              </li>
            </ul>

            <h2 id="pricing">4. Pricing, Fees & Payments</h2>
            <ul>
              <li>
                You set listing prices and applicable taxes unless law requires
                otherwise.
              </li>
              <li>
                Platform fees/commissions are deducted per order; schedules may
                change with notice.
              </li>
              <li>
                Payouts are subject to holds for fraud, chargebacks, or
                disputes.
              </li>
            </ul>

            <h2 id="returns">5. Returns & Refunds</h2>
            <ul>
              <li>
                Publish clear return/cancellation policies consistent with law
                and platform standards.
              </li>
              <li>
                Honor valid return/refund requests and resolve not‑as‑described
                issues promptly.
              </li>
              <li>
                We may issue refunds where required and adjust payouts
                correspondingly.
              </li>
            </ul>

            <h2 id="compliance">6. Compliance & Conduct</h2>
            <ul>
              <li>
                Comply with all laws, taxes, IP rights, privacy, and consumer
                protection obligations.
              </li>
              <li>
                No counterfeit, unsafe, or illegal goods; no deceptive, abusive,
                or fraudulent conduct.
              </li>
              <li>
                We may remove content or suspend/terminate accounts at our
                discretion.
              </li>
            </ul>

            <h2 id="ip">7. Intellectual Property</h2>
            <ul>
              <li>
                You retain ownership of your content; you grant us a
                non‑exclusive license to host, display, and promote it.
              </li>
              <li>
                Report alleged infringement through our contact channels; we
                respond per law.
              </li>
            </ul>

            <h2 id="privacy">8. Data & Privacy</h2>
            <ul>
              <li>
                Use buyer data only to fulfill orders and provide support; do
                not sell or misuse it.
              </li>
              <li>
                Implement reasonable safeguards; see our{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </li>
            </ul>

            <h2 id="disputes">9. Disputes & Liability</h2>
            <ul>
              <li>
                Contact support first; we may mediate disputes between buyers
                and sellers.
              </li>
              <li>
                To the extent permitted by law, our liability is limited;
                services are provided “as is.”
              </li>
            </ul>

            <h2 id="changes">10. Changes & Termination</h2>
            <ul>
              <li>
                We may update these Terms with notice; continued use indicates
                acceptance.
              </li>
              <li>
                We may suspend or terminate access for policy or legal
                violations.
              </li>
            </ul>

            <h2 id="contact">11. Contact</h2>
            <p>
              Questions? Email{" "}
              <a href="mailto:support@desigifting.store">
                support@desigifting.store
              </a>
              .
            </p>

            <h2 id="download">Download</h2>
            <p>
              For your records, you can{" "}
              <a
                className="text-emerald-700"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("PDF generation coming soon.");
                }}
              >
                download a PDF copy
              </a>{" "}
              of these Terms.
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
