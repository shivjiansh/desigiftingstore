import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../lib/firebase";
import SellerLayout from "../../../../components/seller/SellerLayout";
import { notify } from "../../../../lib/notifications";

export default function EditProduct() {
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();
  const { uid: productId } = router.query;

  const categories = [
    "Home Decor",
    "Clothing & Apparel",
    "Accessories",
    "Drinkware",
    "Stationery & Office",
    "Electronics & Tech",
    "Jewelry & Watches",
    "Toys & Games",
    "Sports & Fitness",
    "Beauty & Personal Care",
    "Kitchen & Dining",
    "Art & Collectibles",
    "Custom Gifts",
    "Other",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/seller/auth/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && productId) {
      loadProduct();
    }
  }, [user, productId]);

  useEffect(() => {
    if (product && originalProduct) {
      const changed =
        JSON.stringify(product) !== JSON.stringify(originalProduct);
      setHasChanges(changed);
    }
  }, [product, originalProduct]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const idToken = await user.getIdToken();
      const response = await fetch(`/api/products?id=${productId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load product");
      }

      if (result.success) {
        const productData = {
          ...result.data,
          salesMetrics: result.data.salesMetrics || {
            totalSales: 0,
            totalRevenue: 0,
            monthlySales: {
              current: 0,
              previous: 0,
              byMonth: {
                "2025-01": 0,
                "2025-02": 0,
              },
            },
            monthlyRevenue: {
              current: 0,
              previous: 0,
              byMonth: {
                "2025-01": 0,
                "2025-02": 0,
              },
            },
          },
          specifications: result.data.specifications || {
            dimensions: "",
            weight: "",
            material: "",
            color: "",
            size: "",
          },
          badges: result.data.badges || {
            isHotselling: false,
            isTrending: false,
            isToprated: false,
          },
          ratings: result.data.ratings || {
            average: 0,
            total: 0,
            breakdown: {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0,
            },
          },
          tags: result.data.tags || [],
          images: result.data.images || [],
          hasOffer: result.data.hasOffer || result.data.offerPercentage > 0,
          offerStartDate: result.data.offerStartDate
            ? new Date(result.data.offerStartDate).toISOString().split("T")[0]
            : "",
          offerEndDate: result.data.offerEndDate
            ? new Date(result.data.offerEndDate).toISOString().split("T")[0]
            : "",
        };

        setProduct(productData);
        setOriginalProduct(JSON.parse(JSON.stringify(productData)));
      }
    } catch (error) {
      console.error("Error loading product:", error);
      notify.error(error.message);
      router.push("/seller/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const fieldParts = field.split(".");

      if (fieldParts.length === 2) {
        const [parent, child] = fieldParts;
        setProduct((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      } else if (fieldParts.length === 3) {
        const [parent, child, grandchild] = fieldParts;
        setProduct((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value,
            },
          },
        }));
      }
    } else {
      setProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleOfferToggle = () => {
    setProduct((prev) => ({
      ...prev,
      hasOffer: !prev.hasOffer,
      offerPercentage: prev.hasOffer ? "" : prev.offerPercentage,
      offerStartDate: prev.hasOffer ? "" : prev.offerStartDate,
      offerEndDate: prev.hasOffer ? "" : prev.offerEndDate,
    }));
  };

  const calculateOfferPrice = () => {
    if (!product?.hasOffer || !product?.price || !product?.offerPercentage)
      return 0;
    const discount =
      (parseFloat(product.price) * parseFloat(product.offerPercentage)) / 100;
    return (parseFloat(product.price) - discount).toFixed(2);
  };

  const addTag = () => {
    if (newTag.trim() && !product.tags.includes(newTag.trim().toLowerCase())) {
      setProduct((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setProduct((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", "desigifting/products");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  };

  const handleImageUpload = async (files) => {
    setImageUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(
            `File ${file.name} is too large. Maximum size is 5MB.`
          );
        }

        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not an image.`);
        }

        return uploadToCloudinary(file);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
      notify.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      setErrors({ images: error.message });
      notify.error(error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (imageIndex) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex),
    }));
  };

  const validateProduct = () => {
    const newErrors = {};

    if (!product.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!product.description?.trim()) {
      newErrors.description = "Product description is required";
    }

    if (!product.price || parseFloat(product.price) <= 0) {
      newErrors.price = "Valid price is required";
    }


    if (!product.stock || parseInt(product.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }

    if (!product.images || product.images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    if (product.hasOffer) {
      if (
        !product.offerPercentage ||
        parseFloat(product.offerPercentage) <= 0 ||
        parseFloat(product.offerPercentage) >= 100
      ) {
        newErrors.offerPercentage =
          "Valid offer percentage (1-99%) is required";
      }
      if (!product.offerStartDate) {
        newErrors.offerStartDate = "Offer start date is required";
      }
      if (!product.offerEndDate) {
        newErrors.offerEndDate = "Offer end date is required";
      }
      if (
        product.offerStartDate &&
        product.offerEndDate &&
        new Date(product.offerStartDate) >= new Date(product.offerEndDate)
      ) {
        newErrors.offerEndDate = "Offer end date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProduct = async () => {

    if (!validateProduct()) return;

    try {
      setIsSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const idToken = await user.getIdToken();

      const productData = {
        ...product,
        
        price: parseFloat(product.price),
        originalPrice: product.originalPrice
          ? parseFloat(product.originalPrice)
          : parseFloat(product.price),
        stock: parseInt(product.stock),
        offerPercentage: product.hasOffer
          ? parseFloat(product.offerPercentage)
          : 0,
        offerPrice: product.hasOffer ? parseFloat(calculateOfferPrice()) : 0,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      if (result.success) {
        notify.success("Product updated successfully!");
        setOriginalProduct(JSON.parse(JSON.stringify(productData)));
        setHasChanges(false);
      } else {
        throw new Error(result.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setErrors({ general: error.message });
      notify.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);

      const user = auth.currentUser;
      if (!user) throw new Error("Authentication required");

      const idToken = await user.getIdToken();
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete product");
      }

      if (result.success) {
        notify.success("Product deleted successfully!");
        router.push("/seller/products");
      } else {
        throw new Error(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      notify.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (!product) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Product not found</p>
            <Link
              href="/seller/products"
              className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Product - {product?.name || "Loading..."}</title>
        <meta name="description" content={`Edit ${product?.name}`} />
      </Head>

      <SellerLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <Link
                    href="/seller/products"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Back to Products
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-900 mt-1">
                    Edit Product
                  </h1>
                  <p className="text-gray-600">{product?.name}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={deleteProduct}
                    disabled={isSaving}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Delete Product
                  </button>
                  <button
                    onClick={() => saveProduct()}
                    disabled={isSaving || !hasChanges}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving
                      ? "Saving..."
                      : hasChanges
                      ? "Save Changes"
                      : "No Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Unsaved Changes Warning */}
            {hasChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">⚠️</div>
                  <div>
                    <p className="text-yellow-800 font-medium">
                      You have unsaved changes
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Make sure to save your changes before leaving this page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "fewleft"
                            ? "bg-orange-100 text-orange-800"
                            : product.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status || "inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        value={product.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        rows="4"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.description
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        value={product.description || ""}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe your product in detail..."
                      />
                      {errors.description && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                  

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price * (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.price ? "border-red-300" : "border-gray-300"
                          }`}
                          value={product.price || ""}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          placeholder="0.00"
                        />
                        {errors.price && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={product.originalPrice || ""}
                          onChange={(e) =>
                            handleInputChange("originalPrice", e.target.value)
                          }
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          min="0"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.stock ? "border-red-300" : "border-gray-300"
                          }`}
                          value={product.stock || ""}
                          onChange={(e) =>
                            handleInputChange("stock", e.target.value)
                          }
                          placeholder="0"
                        />
                        {errors.stock && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.stock}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Processing Time
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={product.processingTime || ""}
                        onChange={(e) =>
                          handleInputChange("processingTime", e.target.value)
                        }
                        placeholder="e.g., 2-3 business days"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Specifications */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Specifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={product.specifications?.dimensions || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "specifications.dimensions",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 10cm x 15cm x 5cm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={product.specifications?.weight || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "specifications.weight",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 250g"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={product.specifications?.material || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "specifications.material",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Cotton, Wood, Metal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={product.specifications?.color || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "specifications.color",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Red, Blue, Multi-color"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={product.specifications?.size || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "specifications.size",
                            e.target.value
                          )
                        }
                        placeholder="e.g., XS, S, M, L, XL, One Size"
                      />
                    </div>
                  </div>
                </div>

                {/* Offer Section */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Special Offer
                    </h2>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.hasOffer || false}
                        onChange={handleOfferToggle}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Enable offer for this product
                      </span>
                    </label>
                  </div>

                  {product.hasOffer && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount %
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.offerPercentage
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            value={product.offerPercentage || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "offerPercentage",
                                e.target.value
                              )
                            }
                            placeholder="10"
                          />
                          {errors.offerPercentage && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.offerPercentage}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.offerStartDate
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            value={product.offerStartDate || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "offerStartDate",
                                e.target.value
                              )
                            }
                          />
                          {errors.offerStartDate && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.offerStartDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="date"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.offerEndDate
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            value={product.offerEndDate || ""}
                            onChange={(e) =>
                              handleInputChange("offerEndDate", e.target.value)
                            }
                          />
                          {errors.offerEndDate && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.offerEndDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {product.price && product.offerPercentage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800">
                                Offer Price Preview
                              </p>
                              <p className="text-xs text-green-600">
                                Customers will see this discounted price
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-800">
                                ₹{calculateOfferPrice()}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                ₹{product.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Images */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Images *
                  </h2>

                  <div className="mb-4">
                    <label className="block w-full">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        {imageUploading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">
                              Uploading...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl mb-2">📸</div>
                            <p className="text-gray-600 text-sm">
                              Add more images
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        disabled={imageUploading}
                      />
                    </label>
                    {errors.images && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.images}
                      </p>
                    )}
                  </div>

                  {product.images && product.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {product.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Main Image
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Tags
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags &&
                      product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <button
                      onClick={addTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                

                {/* Product Badges */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Badges
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.badges?.isHotselling || false}
                        onChange={(e) =>
                          handleInputChange(
                            "badges.isHotselling",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Hot Selling</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.badges?.isTrending || false}
                        onChange={(e) =>
                          handleInputChange(
                            "badges.isTrending",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Trending</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.badges?.isToprated || false}
                        onChange={(e) =>
                          handleInputChange(
                            "badges.isToprated",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Top Rated</span>
                    </label>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Additional Settings
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Cash on Delivery
                      </span>
                      <input
                        type="checkbox"
                        checked={product.codAvailable || false}
                        onChange={(e) =>
                          handleInputChange("codAvailable", e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Product Statistics */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sales:</span>
                      <span className="font-semibold">
                        {product.salesMetrics?.totalSales || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-semibold">
                        ₹{(product.salesMetrics?.totalRevenue || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Current Month Sales:
                      </span>
                      <span className="font-semibold">
                        {product.salesMetrics?.monthlySales?.current || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-semibold">
                        {product.ratings?.average || 0}/5 (
                        {product.ratings?.total || 0} reviews)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-sm text-gray-500">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="text-sm text-gray-500">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    </>
  );
}
