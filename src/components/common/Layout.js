import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ 
  children, 
  title = 'Desigifting - Customized Gifts Marketplace', 
  description = 'Create unique, personalized gifts with our multi-vendor marketplace.',
  className = '' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
