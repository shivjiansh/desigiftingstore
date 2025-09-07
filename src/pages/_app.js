import '../styles/globals.css';
import { useEffect } from 'react';
import ToastContainer from '../components/common/ToastContainer';
import { initializeStores } from '../stores';
import { Analytics } from "@vercel/analytics/next";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize stores when app starts
    initializeStores();
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer />
      <Analytics/>
    </>
  );
}
