import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";

export default function PrivacyPolicy() {
  const today = new Date().toLocaleDateString();

  return (
    <>
      <Head>
        <title>Privacy Policy | DesiGifting</title>
        <meta
          name="description"
          content="How DesiGifting collects, uses, shares, and protects your personal data. Learn about cookies, analytics, payments, security measures, and your choices."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/privacy" />
        <meta property="og:title" content="Privacy Policy | DesiGifting" />
        <meta
          property="og:description"
          content="Our practices for data collection, use, sharing, security, international transfers, and user rights."
        />
      </Head>
      <Header/>
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-white border-b">
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-emerald-700 font-semibold">
                  DesiGifting Legal
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">
                  Privacy Policy
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  This Policy explains what data we collect, why we collect it,
                  and how we protect and use it across our services.
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
                  ["#what", "1. Information We Collect"],
                  ["#use", "2. How We Use Information"],
                  ["#share", "3. Sharing & Disclosure"],
                  ["#cookies", "4. Cookies & Tracking"],
                  ["#security", "5. Security & Retention"],
                  ["#rights", "6. Your Choices & Rights"],
                  ["#children", "7. Children’s Privacy"],
                  ["#transfers", "8. International Transfers"],
                  ["#changes", "9. Changes to this Policy"],
                  ["#contact", "10. Contact Us"],
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
              This Privacy Policy describes how DesiGifting (“we”, “us”, “our”)
              collects, uses, and shares information when you browse, create an
              account, buy, or sell on our platform.
            </p>

            <h2 id="what">1. Information We Collect</h2>
            <ul>
              <li>
                Account & profile details (name, email, phone, business info).
              </li>
              <li>
                Transaction data (orders, payments, delivery details, invoices).
              </li>
              <li>
                Content you provide (listings, images, customizations,
                messages).
              </li>
              <li>
                Device & usage data (IP, browser, cookies, analytics events).
              </li>
            </ul>

            <h2 id="use">2. How We Use Information</h2>
            <ul>
              <li>
                Provide and improve marketplace features and user support.
              </li>
              <li>
                Personalize content, measure performance, and prevent
                fraud/abuse.
              </li>
              <li>
                Comply with legal requirements and enforce platform policies.
              </li>
            </ul>

            <h2 id="share">3. Sharing & Disclosure</h2>
            <ul>
              <li>
                With service providers (payments, hosting, analytics, logistics)
                under contract.
              </li>
              <li>With buyers/sellers as needed to complete transactions.</li>
              <li>
                For legal reasons (court orders, law enforcement, regulatory
                requests).
              </li>
            </ul>

            <h2 id="cookies">4. Cookies & Tracking</h2>
            <p>
              We use cookies and similar technologies to keep you signed in,
              remember preferences, and analyze use. Manage cookies in your
              browser settings.
            </p>

            <h2 id="security">5. Security & Retention</h2>
            <ul>
              <li>
                We apply reasonable safeguards to protect data from unauthorized
                access.
              </li>
              <li>
                Retention varies by category and legal need; we keep data as
                necessary for service and compliance.
              </li>
            </ul>

            <h2 id="rights">6. Your Choices & Rights</h2>
            <ul>
              <li>
                Access, correct, or delete your data via account settings or by
                contacting support.
              </li>
              <li>
                Opt-out of marketing emails via footer links; essential service
                emails may continue.
              </li>
              <li>
                Depending on your region, you may have additional rights under
                applicable privacy laws.
              </li>
            </ul>

            <h2 id="children">7. Children’s Privacy</h2>
            <p>
              Our services are not directed to children under 13 (or the
              relevant age in your region). Do not use our services if you do
              not meet the minimum age requirement.
            </p>

            <h2 id="transfers">8. International Transfers</h2>
            <p>
              Data may be processed in countries with different data protection
              laws. We use appropriate measures to protect data during
              cross-border transfers.
            </p>

            <h2 id="changes">9. Changes to this Policy</h2>
            <p>
              We may update this Policy; updates are effective upon posting. If
              changes are material, we will provide reasonable notice.
            </p>

            <h2 id="contact">10. Contact Us</h2>
            <p>
              Questions? Email{" "}
              <a href="mailto:privacy@desigifting.store">
                privacy@desigifting.store
              </a>
              . For seller terms, see{" "}
              <Link href="/seller-terms">Seller Terms</Link>.
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
              of this Policy.
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
