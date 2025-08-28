import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/common/Layout';
import AddressSelector from '../components/buyer/AddressSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, useBuyerGuard } from '../hooks/useAuth';
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { user, updateUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Protect route - buyers only
  useBuyerGuard();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });

      // Set default address if available
      const defaultAddress = user.addresses?.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const result = await updateUser(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'addresses', name: 'Addresses', icon: MapPinIcon },
    { id: 'security', name: 'Security', icon: KeyIcon }
  ];

  if (isLoading) {
    return (
      <Layout title="My Account - Desigifting">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading your account..." />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Account - Desigifting</title>
        <meta name="description" content="Manage your Desigifting account settings and preferences" />
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your profile and account settings</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline btn-sm"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">
                          <UserIcon className="h-4 w-4 inline mr-1" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">
                          <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">
                          <PhoneIcon className="h-4 w-4 inline mr-1" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-input"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || ''
                          });
                        }}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{user.name}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{user.email}</span>
                        {!user.emailVerified && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{user.phone}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Member Since</label>
                      <div className="mt-1">
                        <span className="text-gray-900">
                          {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Addresses</h2>
                <AddressSelector
                  selectedAddress={selectedAddress}
                  onAddressSelect={setSelectedAddress}
                />
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">••••••••••••</span>
                      </div>
                      <button className="btn btn-outline btn-sm">
                        Change Password
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: Never
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-600">Not enabled</span>
                      </div>
                      <button className="btn btn-outline btn-sm">
                        Enable 2FA
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Add an extra layer of security to your account
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Login Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Current session</div>
                          <div className="text-sm text-gray-500">Chrome on Windows • 192.168.1.1</div>
                        </div>
                        <span className="text-sm text-green-600">Active now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
