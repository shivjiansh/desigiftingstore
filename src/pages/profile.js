import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { notify } from "../lib/notifications";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  UserIcon,
  MapPinIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  TruckIcon,
  StarIcon,
  PhotoIcon,
  ArrowLeftIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Image cropping states
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ aspect: 1, width: 200, height: 200 });
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
  });

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    type: "home",
    isDefault: false,
  });

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();

      // Load all data in parallel
      const [profileRes, addressesRes, ordersRes, wishlistRes] =
        await Promise.all([
          fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch("/api/user/addresses", {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch("/api/user/orders", {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch("/api/user/wishlist", {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
        ]);

      // Parse responses
      const [profileData, addressesData, ordersData, wishlistData] =
        await Promise.all([
          profileRes.json(),
          addressesRes.json(),
          ordersRes.json(),
          wishlistRes.json(),
        ]);

      // Set data
      if (profileData.success) {
        setUserProfile(profileData.data || {});
        setProfileForm({
          displayName: profileData.data?.displayName || user.displayName || "",
          email: user.email || "",
          phone: profileData.data?.phone || "",
          dateOfBirth: profileData.data?.dateOfBirth || "",
          gender: profileData.data?.gender || "",
          bio: profileData.data?.bio || "",
        });
      }

      if (addressesData.success) {
        setAddresses(addressesData.data || []);
      }

      if (ordersData.success) {
        setOrders(ordersData.data || []);
      }

      if (wishlistData.success) {
        setWishlist(wishlistData.data || []);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      notify.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection - NEW
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      notify.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      notify.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // Reset input for reselection
    e.target.value = "";
  }, []);

  // Generate cropped image blob - NEW
  const getCroppedImg = useCallback((image, crop) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!crop || !ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          blob.name = "cropped-profile.jpg";
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  }, []);

  // Handle crop confirmation - NEW
  const handleCropConfirm = useCallback(async () => {
    if (!imgRef.current || !crop) return;

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, crop);
      if (croppedImageBlob) {
        await handleProfileImageUpload(croppedImageBlob);
        setShowCropModal(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      notify.error("Failed to crop image");
    }
  }, [crop, getCroppedImg]);

  // Handle crop cancel - NEW
  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const idToken = await user.getIdToken();

      // Update Firebase Auth profile
      if (profileForm.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profileForm.displayName });
      }

      // Update custom profile data
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      const result = await response.json();
      if (result.success) {
        setUserProfile(result.data);
        notify.success("Profile updated successfully");
      } else {
        notify.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      notify.error("Failed to update profile");
    }
  };

  const handleAddAddress = async () => {
    try {
      // Validate required fields
      const requiredFields = [
        "name",
        "phone",
        "addressLine1",
        "city",
        "state",
        "pincode",
      ];
      for (const field of requiredFields) {
        if (!addressForm[field]) {
          notify.error(
            `Please enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
          );
          return;
        }
      }

      const idToken = await user.getIdToken();
      const response = await fetch("/api/user/addresses", {
        method: editingAddress ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingAddress
            ? { ...addressForm, id: editingAddress.id }
            : addressForm
        ),
      });

      const result = await response.json();
      if (result.success) {
        if (editingAddress) {
          setAddresses((prev) =>
            prev.map((addr) =>
              addr.id === editingAddress.id ? result.data : addr
            )
          );
          notify.success("Address updated successfully");
        } else {
          setAddresses((prev) => [...prev, result.data]);
          notify.success("Address added successfully");
        }

        setShowAddAddress(false);
        setEditingAddress(null);
        setAddressForm({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          type: "home",
          isDefault: false,
        });
      } else {
        notify.error(result.error || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      notify.error("Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const result = await response.json();
      if (result.success) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
        notify.success("Address deleted successfully");
      } else {
        notify.error(result.error || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      notify.error("Failed to delete address");
    }
  };

  // UPDATED: Now handles cropped blob instead of raw file
  const handleProfileImageUpload = async (imageFile) => {
    if (!imageFile) return;

    try {
      setUploading(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );
      formData.append("folder", "desigifting/profile");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Update Firebase Auth profile
      await updateProfile(user, { photoURL: uploadResult.secure_url });

      // Update custom profile
      const idToken = await user.getIdToken();
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoURL: uploadResult.secure_url }),
      });

      const result = await response.json();
      if (result.success) {
        setUserProfile((prev) => ({
          ...prev,
          photoURL: uploadResult.secure_url,
        }));
        notify.success("Profile image updated successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      notify.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              <div className="lg:col-span-3 h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile - Desi Gifting</title>
        <meta
          name="description"
          content="Manage your profile, addresses, and orders"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            My Profile
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mx-auto mb-3">
                      {user?.photoURL || userProfile?.photoURL ? (
                        <Image
                          src={user.photoURL || userProfile.photoURL}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex bg-blue-300 items-center justify-center">
                          <span className="text-white text-3xl font-medium">
                            {user?.displayName?.charAt(0)?.toUpperCase() ||
                              user?.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* UPDATED: File input now triggers crop modal */}
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                      <PhotoIcon className="w-4 h-4" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {profileForm.displayName || "User"}
                  </h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>

                <nav className="space-y-2">
                  {[
                    {
                      id: "profile",
                      label: "Profile Information",
                      icon: UserIcon,
                    },
                    { id: "addresses", label: "Addresses", icon: MapPinIcon },
                    { id: "orders", label: "My Orders", icon: ShoppingBagIcon },
                    { id: "wishlist", label: "Wishlist", icon: HeartIcon },
                    { id: "settings", label: "Settings", icon: CogIcon },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Information */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.displayName}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows="3"
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Addresses */}
              {activeTab === "addresses" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Saved Addresses
                    </h2>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No addresses saved
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Add your first address to make checkout faster
                      </p>
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-gray-900">
                                  {address.name}
                                </h3>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    address.type === "home"
                                      ? "bg-blue-100 text-blue-800"
                                      : address.type === "work"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {address.type}
                                </span>
                                {address.isDefault && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.phone}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(address);
                                  setAddressForm(address);
                                  setShowAddAddress(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            {address.addressLine1}
                            {address.addressLine2 &&
                              `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-700">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Address Modal */}
                  {showAddAddress && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold">
                            {editingAddress
                              ? "Edit Address"
                              : "Add New Address"}
                          </h3>
                          <button
                            onClick={() => {
                              setShowAddAddress(false);
                              setEditingAddress(null);
                              setAddressForm({
                                name: "",
                                phone: "",
                                addressLine1: "",
                                addressLine2: "",
                                city: "",
                                state: "",
                                pincode: "",
                                type: "home",
                                isDefault: false,
                              });
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={addressForm.name}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={addressForm.phone}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 1 *
                            </label>
                            <input
                              type="text"
                              placeholder="House/Flat No., Building, Area"
                              value={addressForm.addressLine1}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  addressLine1: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              placeholder="Landmark (Optional)"
                              value={addressForm.addressLine2}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  addressLine2: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  state: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              PIN Code *
                            </label>
                            <input
                              type="text"
                              value={addressForm.pincode}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  pincode: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Type
                            </label>
                            <select
                              value={addressForm.type}
                              onChange={(e) =>
                                setAddressForm((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={addressForm.isDefault}
                                onChange={(e) =>
                                  setAddressForm((prev) => ({
                                    ...prev,
                                    isDefault: e.target.checked,
                                  }))
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Set as default address
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                          <button
                            onClick={() => {
                              setShowAddAddress(false);
                              setEditingAddress(null);
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddAddress}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                          >
                            {editingAddress ? "Update Address" : "Add Address"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Orders */}
              {activeTab === "orders" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    My Orders
                  </h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No orders yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        When you place your first order, it will appear here
                      </p>
                      <button
                        onClick={() => router.push("/products")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Order #{order.orderId}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Placed on{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${getOrderStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Items: {order.items?.length || 0}
                              </p>
                              <p className="text-sm text-gray-600">
                                Total: ₹
                                {order.totalAmount?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Payment: {order.paymentMethod}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: {order.paymentStatus || "Pending"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Details
                            </button>
                            {order.status === "delivered" && (
                              <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1">
                                <StarIcon className="w-4 h-4" />
                                <span>Rate & Review</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist */}
              {activeTab === "wishlist" && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    My Wishlist
                  </h2>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Your wishlist is empty
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Save items you love for later
                      </p>
                      <button
                        onClick={() => router.push("/products")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            {item.product?.images?.[0]?.url ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            ₹{item.product?.price}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                router.push(`/products/${item.product?.id}`)
                              }
                              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                            >
                              View Product
                            </button>
                            <button className="text-red-600 hover:text-red-700 p-2">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              {activeTab === "settings" && (
                <div className="bg-white rounded-lg shadow-sm border p-6 relative">
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-white/1 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center p-8 max-w-md">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Coming Soon!
                      </h3>

                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        Our development team is working hard to bring you these
                        settings. This feature will be available very soon.
                        Thanks for your patience!
                      </p>

                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            (window.location.href =
                              "mailto:shivansh.jauhari@gmail.com?subject=Settings Feature Question")
                          }
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Contact Developer Team
                        </button>

                        <p className="text-xs text-gray-500">
                          Have questions or suggestions? We'd love to hear from
                          you!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Original Settings Content (dimmed/disabled) */}
                  <div className="opacity-30 pointer-events-none">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Account Settings
                    </h2>

                    <div className="space-y-6">
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Privacy & Security
                        </h3>
                        <div className="space-y-3">
                          <button className="flex items-center justify-between w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                            <span className="font-medium text-gray-700">
                              Change Password
                            </span>
                            <span className="text-gray-400">→</span>
                          </button>
                          <button className="flex items-center justify-between w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                            <span className="font-medium text-gray-700">
                              Two-Factor Authentication
                            </span>
                            <span className="text-gray-400">→</span>
                          </button>
                        </div>
                      </div>

                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Notifications
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                              Email Notifications
                            </span>
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              defaultChecked
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                              SMS Notifications
                            </span>
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                              Order Updates
                            </span>
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              defaultChecked
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-red-600 mb-4">
                          Danger Zone
                        </h3>
                        <button className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100">
                          Delete Account
                        </button>
                        <p className="text-sm text-gray-600 mt-2">
                          This action cannot be undone. All your data will be
                          permanently deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NEW: Image Crop Modal */}
        {showCropModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">
                  Crop Your Profile Picture
                </h3>
                <button
                  onClick={handleCropCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Crop Area */}
              <div className="p-6">
                <div className="mb-4">
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    aspect={1} // Square aspect ratio
                    circularCrop // Optional: for circular profile pics
                    minWidth={100}
                    minHeight={100}
                    maxWidth={400}
                    maxHeight={400}
                  >
                    <img
                      ref={imgRef}
                      src={selectedImage}
                      alt="Crop preview"
                      style={{ maxHeight: "400px", maxWidth: "100%" }}
                      onLoad={() => {
                        // Set initial crop when image loads
                        if (imgRef.current) {
                          const { width, height } = imgRef.current;
                          const size = Math.min(width, height, 200);
                          setCrop({
                            aspect: 1,
                            width: size,
                            height: size,
                            x: (width - size) / 2,
                            y: (height - size) / 2,
                          });
                        }
                      }}
                    />
                  </ReactCrop>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  💡 Drag to reposition and resize the crop area for your
                  perfect profile picture
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCropCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Apply & Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
