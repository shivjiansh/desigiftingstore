import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const buyerNavItems = [
    { href: '/products', label: 'Browse Products', icon: ShoppingBagIcon },
    { href: '/account', label: 'My Account', icon: UserIcon },
    { href: '/orders', label: 'My Orders', icon: ShoppingBagIcon }
  ];

  const sellerNavItems = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { href: '/seller/products', label: 'Products', icon: ShoppingBagIcon },
    { href: '/seller/orders', label: 'Orders', icon: ShoppingBagIcon },
    { href: '/seller/analytics', label: 'Analytics', icon: ChartBarIcon }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
            <span className="text-2xl">🎁</span>
            <span className="text-xl font-bold">Desigifting</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search products..."
                onClick={() => router.push('/products')}
              />
            </div>

            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Products
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-600">
                  Hello, <span className="font-medium">{user?.name || 'User'}</span>!
                </span>

                {role === 'buyer' ? (
                  <div className="nav-dropdown">
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors font-medium">
                      <UserIcon className="h-4 w-4" />
                      <span>Account</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="nav-dropdown-menu">
                      {buyerNavItems.map(item => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href} className="nav-dropdown-item">
                            <Icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <hr className="my-1" />
                      <button 
                        onClick={handleLogout} 
                        className="nav-dropdown-item text-left w-full flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="nav-dropdown">
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors font-medium">
                      <ChartBarIcon className="h-4 w-4" />
                      <span>Seller Panel</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="nav-dropdown-menu">
                      {sellerNavItems.map(item => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href} className="nav-dropdown-item">
                            <Icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <Link href="/seller/products/add" className="nav-dropdown-item">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Product
                      </Link>
                      <hr className="my-1" />
                      <button 
                        onClick={handleLogout} 
                        className="nav-dropdown-item text-left w-full flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/buyer/auth/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link href="/buyer/auth/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-slide-down">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search products..."
                  onClick={() => { router.push('/products'); setIsMobileMenuOpen(false); }}
                />
              </div>

              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="py-2 text-sm text-gray-600 border-t border-gray-200">
                    <span>Hello, <span className="font-medium">{user?.name || 'User'}</span>!</span>
                  </div>

                  {role === 'buyer' ? (
                    <>
                      {buyerNavItems.map(item => {
                        const Icon = item.icon;
                        return (
                          <Link 
                            key={item.href}
                            href={item.href} 
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {sellerNavItems.map(item => {
                        const Icon = item.icon;
                        return (
                          <Link 
                            key={item.href}
                            href={item.href} 
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                      <Link 
                        href="/seller/products/add" 
                        className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add Product</span>
                      </Link>
                    </>
                  )}

                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors font-medium py-2 text-left"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <Link href="/buyer/auth/login" className="btn btn-outline" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/buyer/auth/register" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
