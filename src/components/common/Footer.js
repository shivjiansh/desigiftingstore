import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon 
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🎁</span>
              <h3 className="text-xl font-bold text-primary-400">Desigifting</h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Create unique, personalized gifts with our multi-vendor marketplace. 
              Connect with talented sellers and make every gift special.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-gray-300">
                <EnvelopeIcon className="h-4 w-4" />
                <span className="text-sm">hello@desigifting.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <PhoneIcon className="h-4 w-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPinIcon className="h-4 w-4" />
                <span className="text-sm">123 Gift Street, Custom City, CC 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200" aria-label="Twitter">
                🐦
              </a>
              <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200" aria-label="Instagram">
                📷
              </a>
              <a href="#" className="text-2xl hover:scale-110 transition-transform duration-200" aria-label="LinkedIn">
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/buyer/auth/register" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/seller/auth/register" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} Desigifting. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-primary-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Made with <span className="text-red-400">❤️</span> for personalized gifting
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
