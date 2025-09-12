import '../styles/globals.css';
import { useEffect } from 'react';
import ToastContainer from '../components/common/ToastContainer';
import { initializeStores } from '../stores';
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize stores when app starts
    initializeStores();
  }, []);

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-Y2HNY0C7E6"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y2HNY0C7E6');
          `}
      </Script>
      <Component {...pageProps} />
      <ToastContainer />
      <Analytics />
    </>
  );
}
