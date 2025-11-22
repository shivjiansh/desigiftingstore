import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header"; // Adjust if needed

export default function CookiesPolicy() {
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
        <title>Cookies Policy | DesiGifting</title>
        <meta
          name="description"
          content="Our Cookies Policy explains what cookies are, how we use them, and your rights for managing preferences at DesiGifting. Learn about analytics, personalization, and advertising cookies used on our site."
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="http://localhost:3000/cookies" />
        <meta property="og:title" content="Cookies Policy | DesiGifting" />
        <meta
          property="og:description"
          content="See how we use cookies and similar technologies on DesiGifting, how you can control them, and what your privacy rights are."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
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
                  Cookies Policy
                </h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  This Cookies Policy describes how and why DesiGifting and our
                  partners use cookies and similar technologies, and how you can
                  control your preferences.
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
                  ["#about", "1. What are Cookies?"],
                  ["#uses", "2. How We Use Cookies"],
                  ["#types", "3. Types of Cookies Used"],
                  ["#thirdparty", "4. Third-Party Cookies"],
                  ["#choices", "5. Managing Cookie Preferences"],
                  ["#moreinfo", "6. More Information"],
                  ["#changes", "7. Changes to this Policy"],
                  ["#contact", "8. Contact"],
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
            <h2 id="about">1. What are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device (computer,
              tablet, or mobile) by your web browser. They help remember your
              preferences, support secure logins, enable personalized
              experiences, and allow website analytics and advertising.
            </p>

            <h2 id="uses">2. How We Use Cookies</h2>
            <ul>
              <li>To keep you logged in and remember site preferences.</li>
              <li>
                To analyze site traffic and measure how our site is used (e.g.,
                Google Analytics).
              </li>
              <li>
                To optimize your browsing experience and recommend products.
              </li>
              <li>
                To support secure transactions (e.g., checkout, account area).
              </li>
              <li>
                To deliver relevant offers and measure ad campaign
                effectiveness.
              </li>
            </ul>

            <h2 id="types">3. Types of Cookies Used</h2>
            <ul>
              <li>
                <b>Necessary/Essential Cookies:</b> Required for site operation
                or services requested by you (e.g., login, cart, security).
              </li>
              <li>
                <b>Preference or Functional Cookies:</b> Remember your settings
                and personalize site experience.
              </li>
              <li>
                <b>Analytics/Performance Cookies:</b> Collect aggregate
                information (like page views, clicks) to help us improve site
                performance.
              </li>
              <li>
                <b>Marketing/Advertising Cookies:</b> Enable personalized ads
                and measure marketing effectiveness. Only set with your consent.
              </li>
            </ul>

            <h2 id="thirdparty">4. Third-Party Cookies</h2>
            <ul>
              <li>
                Some cookies are placed by third parties (e.g., Google
                Analytics, Facebook Pixel) for analytics or advertising.
              </li>
              <li>
                See our <Link href="/privacy">Privacy Policy</Link> for a list
                of third-party services and links to their privacy policies.
              </li>
            </ul>

            <h2 id="choices">5. Managing Cookie Preferences</h2>
            <ul>
              <li>
                You can review, accept, or manage non-essential cookies via our
                cookie banner (shown on first visit or after clearing cache).
              </li>
              <li>
                You can disable or delete cookies in your browser settings.
                Note: Essential cookies are required for parts of this website
                to function.
              </li>
              <li>
                For more information, see:{" "}
                <a
                  href="https://www.allaboutcookies.org/manage-cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700"
                >
                  allaboutcookies.org/manage-cookies
                </a>
              </li>
            </ul>

            <h2 id="moreinfo">6. More Information</h2>
            <p>
              If you have questions about our use of cookies or privacy
              practices, read our <Link href="/privacy">Privacy Policy</Link> or
              contact us below.
            </p>

            <h2 id="changes">7. Changes to this Policy</h2>
            <p>
              We may update this Cookies Policy from time to time. Updates will
              be posted on this page. Continued use of the site indicates your
              acceptance. Last updated: {today}
            </p>

            <h2 id="contact">8. Contact</h2>
            <p>
              For privacy or cookie-related requests, email{" "}
              <a href="mailto:desigifting@gmail.com">desigifting@gmail.com</a>{" "}
              or visit our <Link href="/help">Help Center</Link>.
            </p>
            <h2 id="download">Download</h2>
            <p>
              Need a copy?{" "}
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
