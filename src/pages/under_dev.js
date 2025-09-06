import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function UnderDevelopment() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    // Add email to notification list logic here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <>
      <Head>
        <title>Feature Under Development - DesiGifting</title>
        <meta
          name="description"
          content="This feature is currently under development. Get notified when it's ready!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        {/* Header */}
        <header className="py-6 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/images/logo1.png"
                alt="DesiGifting Logo"
                width={40}
                height={40}
                className="rounded-xl shadow-lg object-contain bg-white p-1.5 border border-gray-200"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">DesiGifting</h1>
                <p className="text-xs text-gray-600">Make It Personal</p>
              </div>
            </Link>

            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* Animated Icon */}
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 animate-pulse"></div>
                <div className="relative z-10 text-6xl">🚧</div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-lg">⚡</span>
              </div>
              <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center animate-bounce delay-300">
                <span className="text-sm">🔨</span>
              </div>
            </div>

            {/* Main Message */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                We're Building Something
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Amazing!
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                This feature is currently in development and testing phase.
              </p>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    In Progress
                  </span>
                </div>

                <p className="text-gray-700 text-lg mb-4">
                  Our developers and testers are working hard to bring you this
                  feature.
                </p>

                {/* Progress Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl">✓</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Planning
                    </p>
                    <p className="text-xs text-gray-500">Complete</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                      <span className="text-xl">⚡</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Development
                    </p>
                    <p className="text-xs text-gray-500">In Progress</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl">🚀</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Launch
                    </p>
                    <p className="text-xs text-gray-500">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notify Me Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Get Notified When It's Ready!
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to know when this feature launches. We'll send you
                an update as soon as it's available.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleNotifySubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      Notify Me
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-center space-x-2 py-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-green-600 font-semibold">
                    Thanks! We'll notify you when it's ready.
                  </p>
                </div>
              )}
            </div>

            {/* Alternative Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl border-2 border-indigo-200 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center space-x-6 mb-4">
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/support"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Support
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 DesiGifting. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
