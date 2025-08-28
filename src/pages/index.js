import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import ProductCard from '../components/buyer/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { 
  SparklesIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const { products, loadProducts, isLoading } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // useEffect(() => {
  //   loadProducts();
  // }, []);

  // useEffect(() => {
  //   // Get first 8 products as featured
  //   if (products.length > 0) {
  //     setFeaturedProducts(products.slice(0, 8));
  //   }
  // }, [products]);

  const features = [
    {
      icon: SparklesIcon,
      title: 'Unique Customization',
      description: 'Personalize every gift with text, images, and special touches'
    },
    {
      icon: HeartIcon,
      title: 'Handcrafted Quality',
      description: 'Every item is made with love by talented artisans worldwide'
    },
    {
      icon: TruckIcon,
      title: 'Fast Delivery',
      description: 'Get your gifts delivered quickly with tracking included'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Satisfaction Guaranteed',
      description: '100% money-back guarantee on all personalized gifts'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Talented Sellers' },
    { number: '50,000+', label: 'Custom Gifts Created' },
    { number: '4.9', label: 'Average Rating' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Gift Buyer',
      content: 'The custom mug I ordered turned out perfect! The seller was amazing to work with.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Seller',
      content: 'Desigifting has helped me turn my hobby into a thriving business. Great platform!',
      rating: 5
    },
    {
      name: 'Emma Wilson',
      role: 'Gift Recipient',
      content: 'My personalized photo frame was exactly what I wanted. Such attention to detail!',
      rating: 5
    }
  ];

  return (
    <Layout 
      title="Desigifting - Personalized Gifts Marketplace"
      description="Create unique, customized gifts with our multi-vendor marketplace. Connect with talented sellers and make every gift special."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <SparklesIcon className="h-4 w-4" />
              <span>Premium Custom Gifts Marketplace</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create <span className="text-primary-600">Unique Gifts</span><br />
              That Tell Your Story
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Discover thousands of customizable products from talented artisans worldwide. 
              Personalize with your photos, text, and ideas to create gifts that matter.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => router.push('/products')}
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                Start Shopping
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
              <button
                onClick={() => router.push('/seller/auth/register')}
                className="btn btn-outline btn-lg w-full sm:w-auto"
              >
                Become a Seller
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Desigifting?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make personalized gifting simple, reliable, and magical
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular customizable gifts
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  className="hover:shadow-lg transition-shadow"
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/products" className="btn btn-primary btn-lg">
              View All Products
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy customers and sellers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Create Something Special?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our community of gift-givers and makers. Start your personalized gift journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/buyer/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg w-full sm:w-auto">
              Sign Up as Buyer
            </Link>
            <Link href="/seller/auth/register" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg w-full sm:w-auto">
              Join as Seller
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
