import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { toast } from "react-hot-toast";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  UserIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ShareIcon,
  CogIcon,
  PhotoIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Enhanced Image Upload Component with Cropping
function ImageUpload({ label, imageUrl, onImageChange, aspectRatio = "1:1" }) {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({
    aspect: aspectRatio === "1:1" ? 1 : 16 / 9,
  });
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  // Handle file selection - now opens crop modal
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
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

  // Generate cropped image blob
  const getCroppedImg = useCallback(
    (image, crop) => {
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
            blob.name = `cropped-${label
              .toLowerCase()
              .replace(/\s+/g, "-")}.jpg`;
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      });
    },
    [label]
  );

  // Handle crop confirmation
  const handleCropConfirm = useCallback(async () => {
    if (!imgRef.current || !crop) return;

    try {
      setUploading(true);
      const croppedImageBlob = await getCroppedImg(imgRef.current, crop);

      if (croppedImageBlob) {
        // Upload cropped image to Cloudinary
        const formData = new FormData();
        formData.append("file", croppedImageBlob);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );
        formData.append("folder", "desigifting/seller");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        onImageChange(data.secure_url);
        toast.success("Image uploaded successfully!");

        setShowCropModal(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }, [crop, getCroppedImg, onImageChange]);

  // Handle crop cancel
  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeImage = () => {
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {aspectRatio === "16:9" && (
            <span className="text-xs text-gray-500 ml-2">
              (Recommended: 1200x675px)
            </span>
          )}
          {aspectRatio === "1:1" && (
            <span className="text-xs text-gray-500 ml-2">
              (Recommended: 400x400px)
            </span>
          )}
        </label>

        {imageUrl ? (
          <div className="relative inline-block">
            <div
              className={`relative ${
                aspectRatio === "16:9" ? "w-64 h-36" : "w-32 h-32"
              } rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50`}
            >
              <img
                src={imageUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    disabled={uploading}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    disabled={uploading}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className={`${
                aspectRatio === "16:9" ? "w-64 h-36" : "w-32 h-32"
              } border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-gray-600 disabled:opacity-50`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-xs mt-2">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <PhotoIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs font-medium">Upload {label}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Click to browse
                  </span>
                </div>
              )}
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        <p className="text-xs text-gray-500">
          Supports JPG, PNG, GIF up to 5MB
        </p>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Crop Your {label}
              </h3>
              <button
                onClick={handleCropCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={uploading}
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
                  aspect={aspectRatio === "1:1" ? 1 : 16 / 9}
                  minWidth={aspectRatio === "1:1" ? 100 : 200}
                  minHeight={aspectRatio === "1:1" ? 100 : 112}
                  maxWidth={aspectRatio === "1:1" ? 400 : 800}
                  maxHeight={aspectRatio === "1:1" ? 400 : 450}
                >
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Crop preview"
                    style={{
                      maxHeight: aspectRatio === "1:1" ? "400px" : "450px",
                      maxWidth: "100%",
                    }}
                    onLoad={() => {
                      // Set initial crop when image loads
                      if (imgRef.current) {
                        const { width, height } = imgRef.current;
                        let cropWidth, cropHeight, x, y;

                        if (aspectRatio === "1:1") {
                          const size = Math.min(width, height, 300);
                          cropWidth = cropHeight = size;
                          x = (width - size) / 2;
                          y = (height - size) / 2;
                        } else {
                          // 16:9 aspect ratio
                          const targetWidth = Math.min(width, 480);
                          const targetHeight = targetWidth * (9 / 16);
                          cropWidth = targetWidth;
                          cropHeight = Math.min(targetHeight, height);
                          x = (width - cropWidth) / 2;
                          y = (height - cropHeight) / 2;
                        }

                        setCrop({
                          aspect: aspectRatio === "1:1" ? 1 : 16 / 9,
                          width: cropWidth,
                          height: cropHeight,
                          x,
                          y,
                        });
                      }
                    }}
                  />
                </ReactCrop>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                💡{" "}
                {aspectRatio === "1:1"
                  ? "Drag to reposition and resize the crop area for your perfect square logo"
                  : "Drag to reposition and resize the crop area for your perfect banner (16:9 ratio)"}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCropCancel}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
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
                      Crop & Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SellerProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();

  // Form data state
  const [formData, setFormData] = useState({
    // Personal info
    name: "",
    phone: "",
    email: "",

    // Business info
    businessName: "",
    tagline: "",
    description: "",
    businessPhone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    businessType: "individual",
    gstNumber: "",
    logo: "",
    banner: "",

    // Bank info
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",

    // Social links
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",

    // Store settings
    processingTime: "3-5 business days",
    shippingPolicies: "",
    returnPolicy: "",
    customOrdersEnabled: true,
    minimumOrderValue: 0,
    isActive: true,
  });

  const tabs = [
    { id: "personal", name: "Personal Info", icon: UserIcon },
    { id: "business", name: "Business Info", icon: BuildingOfficeIcon },
    { id: "bank", name: "Bank Details", icon: BanknotesIcon },
    { id: "social", name: "Social Links", icon: ShareIcon },
    { id: "store", name: "Store Settings", icon: CogIcon },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/seller/auth/login");
        return;
      }
      setUser(currentUser);
      await loadProfile(currentUser.uid);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Track changes
    if (profile) {
      setHasChanges(
        JSON.stringify(formData) !== JSON.stringify(getInitialFormData(profile))
      );
    }
  }, [formData, profile]);

  const loadProfile = async (uid) => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/seller?uid=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      console.log(result);
      if (result) {
        console.log("fetched data for seller profile$$$$$$   ", result);
        setProfile(result);
        setFormData(getInitialFormData(result));
      } else {
        toast.error("Failed to load profiles");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profiles");
    } finally {
      setLoading(false);
    }
  };

  const getInitialFormData = (profileData) => {
    return {
      name: profileData.name || "",
      phone: profileData.phone || "",
      email: profileData.email || "",
      businessName: profileData.businessInfo?.businessName || "",
      tagline: profileData.businessInfo?.tagline || "",
      description: profileData.businessInfo?.description || "",
      businessPhone: profileData.businessInfo?.businessPhone || "",
      street: profileData.businessInfo?.address?.street || "",
      city: profileData.businessInfo?.address?.city || "",
      state: profileData.businessInfo?.address?.state || "",
      pincode: profileData.businessInfo?.address?.pincode || "",
      country: profileData.businessInfo?.address?.country || "India",
      businessType: profileData.businessInfo?.businessType || "individual",
      gstNumber: profileData.businessInfo?.gstNumber || "",
      logo: profileData.businessInfo?.logo || "",
      banner: profileData.businessInfo?.banner || "",
      accountHolderName: profileData.bankInfo?.accountHolderName || "",
      accountNumber: profileData.bankInfo?.accountNumber || "",
      bankName: profileData.bankInfo?.bankName || "",
      ifscCode: profileData.bankInfo?.ifscCode || "",
      website: profileData.socialLinks?.website || "",
      facebook: profileData.socialLinks?.facebook || "",
      instagram: profileData.socialLinks?.instagram || "",
      twitter: profileData.socialLinks?.twitter || "",
      processingTime:
        profileData.storeSettings?.processingTime || "3-5 business days",
      shippingPolicies: profileData.storeSettings?.shippingPolicies || "",
      returnPolicy: profileData.storeSettings?.returnPolicy || "",
      customOrdersEnabled:
        profileData.storeSettings?.customOrdersEnabled ?? true,
      minimumOrderValue: profileData.storeSettings?.minimumOrderValue || 0,
      isActive: profileData.storeSettings?.isActive ?? true,
    };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error if exists
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";

    // Business validation
    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";

    // Bank validation (if any field is filled, all should be filled)
    const bankFields = [
      "accountHolderName",
      "accountNumber",
      "bankName",
      "ifscCode",
    ];
    const filledBankFields = bankFields.filter((field) =>
      formData[field].trim()
    );
    if (
      filledBankFields.length > 0 &&
      filledBankFields.length < bankFields.length
    ) {
      bankFields.forEach((field) => {
        if (!formData[field].trim()) {
          newErrors[field] = "All bank details are required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      setSaving(true);
      const token = await user.getIdToken();

      const response = await fetch(`/api/seller/${user.uid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Profile updated successfully!");
        setHasChanges(false);
        await loadProfile(user.uid); // Reload profile
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setFormData(getInitialFormData(profile));
    setErrors({});
    setHasChanges(false);
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full"></div>
        </div>
      </SellerLayout>
    );
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phone ? "border-red-300" : "border-gray-300"
            }`}
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Your phone number"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          value={formData.email}
          disabled
          placeholder="Your email address"
        />
        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
      </div>
    </div>
  );

  const renderBusinessInfo = () => (
    <div className="space-y-8">
      {/* Basic Business Info */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.businessName ? "border-red-300" : "border-gray-300"
              }`}
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              placeholder="Your business name"
            />
            {errors.businessName && (
              <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.businessPhone}
              onChange={(e) =>
                handleInputChange("businessPhone", e.target.value)
              }
              placeholder="Business phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Tagline
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.tagline}
            onChange={(e) => handleInputChange("tagline", e.target.value)}
            placeholder="Short tagline for your business"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your business..."
          />
        </div>
      </div>

      {/* Business Images */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Business Images
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUpload
            label="Business Logo"
            imageUrl={formData.logo}
            onImageChange={(url) => handleInputChange("logo", url)}
            aspectRatio="1:1"
          />

          <ImageUpload
            label="Business Banner"
            imageUrl={formData.banner}
            onImageChange={(url) => handleInputChange("banner", url)}
            aspectRatio="16:9"
          />
        </div>
      </div>

      {/* Business Address */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Business Address
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? "border-red-300" : "border-gray-300"
                }`}
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.state ? "border-red-300" : "border-gray-300"
                }`}
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
              />
              {errors.state && (
                <p className="text-red-600 text-sm mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pincode ? "border-red-300" : "border-gray-300"
                }`}
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                placeholder="Pincode"
              />
              {errors.pincode && (
                <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.gstNumber}
                onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                placeholder="GST number (optional)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBankInfo = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="text-yellow-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Bank Details Required for Payouts
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              All bank details must be provided together to enable payouts for
              your orders.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.accountHolderName ? "border-red-300" : "border-gray-300"
            }`}
            value={formData.accountHolderName}
            onChange={(e) =>
              handleInputChange("accountHolderName", e.target.value)
            }
            placeholder="Account holder name"
          />
          {errors.accountHolderName && (
            <p className="text-red-600 text-sm mt-1">
              {errors.accountHolderName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.accountNumber ? "border-red-300" : "border-gray-300"
            }`}
            value={formData.accountNumber}
            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
            placeholder="Account number"
          />
          {errors.accountNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.bankName ? "border-red-300" : "border-gray-300"
            }`}
            value={formData.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            placeholder="Bank name"
          />
          {errors.bankName && (
            <p className="text-red-600 text-sm mt-1">{errors.bankName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.ifscCode ? "border-red-300" : "border-gray-300"
            }`}
            value={formData.ifscCode}
            onChange={(e) => handleInputChange("ifscCode", e.target.value)}
            placeholder="IFSC code"
          />
          {errors.ifscCode && (
            <p className="text-red-600 text-sm mt-1">{errors.ifscCode}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.facebook}
            onChange={(e) => handleInputChange("facebook", e.target.value)}
            placeholder="https://facebook.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.instagram}
            onChange={(e) => handleInputChange("instagram", e.target.value)}
            placeholder="https://instagram.com/youraccount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twitter
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.twitter}
            onChange={(e) => handleInputChange("twitter", e.target.value)}
            placeholder="https://twitter.com/youraccount"
          />
        </div>
      </div>
    </div>
  );

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Time
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.processingTime}
            onChange={(e) =>
              handleInputChange("processingTime", e.target.value)
            }
          >
            <option value="1-2 business days">1-2 business days</option>
            <option value="3-5 business days">3-5 business days</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="Custom timeline">Custom timeline</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Order Value (₹)
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.minimumOrderValue}
            onChange={(e) =>
              handleInputChange("minimumOrderValue", e.target.value)
            }
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shipping Policies
        </label>
        <textarea
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.shippingPolicies}
          onChange={(e) =>
            handleInputChange("shippingPolicies", e.target.value)
          }
          placeholder="Describe your shipping policies..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Return Policy
        </label>
        <textarea
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.returnPolicy}
          onChange={(e) => handleInputChange("returnPolicy", e.target.value)}
          placeholder="Describe your return policy..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Custom Orders</h4>
            <p className="text-sm text-gray-600">
              Accept custom order requests from customers
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.customOrdersEnabled}
              onChange={(e) =>
                handleInputChange("customOrdersEnabled", e.target.checked)
              }
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Store Active</h4>
            <p className="text-sm text-gray-600">
              Your store is visible to customers
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonalInfo();
      case "business":
        return renderBusinessInfo();
      case "bank":
        return renderBankInfo();
      case "social":
        return renderSocialLinks();
      case "store":
        return renderStoreSettings();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <SellerLayout>
      <Head>
        <title>Profile Settings - Seller Dashboard</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your personal and business information
            </p>
          </div>

          {hasChanges && (
            <div className="flex items-center gap-3">
              <button
                onClick={resetChanges}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 mr-2 inline" />
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2 inline" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Changes Alert */}
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Unsaved Changes
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have unsaved changes. Don't forget to save your changes
                  before leaving.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {tabs.find((tab) => tab.id === activeTab)?.name}
              </h2>
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
