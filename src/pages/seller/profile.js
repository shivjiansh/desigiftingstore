import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import SellerLayout from "../../components/seller/SellerLayout";
import { useSellerDashboard } from "../../hooks/useSeller";
import { notify } from "../../lib/notifications";
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  KeyIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function SellerProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const {
    profile,
    metrics,
    isLoading: sellerDataLoading,
    loadData: loadSellerData,
  } = useSellerDashboard(user?.uid);

  const [form, setForm] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/seller/auth/login");
      setUser(u);
      loadSellerData(u.uid);
    });
    return unsub;
  }, [router, loadSellerData]);

  useEffect(() => {
    if (profile) {
      setForm({ ...profile });
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!form.name) errs.name = "Name required";
    if (!form.phone) errs.phone = "Phone required";
    if (!form.businessName) errs.businessName = "Business name required";
    if (!form.businessAddress) errs.businessAddress = "Address required";
    if (form.website && !/^https?:\/\//.test(form.website)) {
      errs.website = "Must start http:// or https://";
    }
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Save failed");
      }
      setSuccess("Profile updated");
      loadSellerData(user.uid);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErrors({ general: e.message });
      notify.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updatePwd = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords must match" });
      return;
    }
    setUpdatingPwd(true);
    try {
      const cred = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, passwordData.newPassword);
      notify.success("Password updated");
      setShowPwdModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      setErrors({
        currentPassword:
          e.code === "auth/wrong-password"
            ? "Incorrect current password"
            : "Update failed",
      });
    } finally {
      setUpdatingPwd(false);
    }
  };

  if (sellerDataLoading || !form) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <Head>
        <title>Profile Settings</title>
      </Head>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPwdModal(true)}
              className="px-4 py-2 bg-gray-100 rounded"
            >
              Change Password
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {errors.general && <p className="text-red-600">{errors.general}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* Personal Info */}
        <div className="bg-white shadow rounded p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              value={form.email}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm">Business Name</label>
            <input
              value={form.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.businessName && (
              <p className="text-red-600 text-sm">{errors.businessName}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">Business Address</label>
            <textarea
              rows="3"
              value={form.businessAddress}
              onChange={(e) => handleChange("businessAddress", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.businessAddress && (
              <p className="text-red-600 text-sm">{errors.businessAddress}</p>
            )}
          </div>
          <div>
            <label className="block text-sm">Website</label>
            <input
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.website && (
              <p className="text-red-600 text-sm">{errors.website}</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white shadow rounded p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {["facebook", "instagram", "twitter"].map((platform) => (
            <div key={platform}>
              <label className="block text-sm capitalize">{platform}</label>
              <input
                value={form.socialLinks[platform] || ""}
                onChange={(e) =>
                  handleChange("socialLinks", {
                    ...form.socialLinks,
                    [platform]: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
          ))}
        </div>

        {/* Change Password Modal */}
        {showPwdModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded p-6 w-full max-w-md">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Change Password</h2>
                <button onClick={() => setShowPwdModal(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {["currentPassword", "newPassword", "confirmPassword"].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-sm">
                        {field === "currentPassword"
                          ? "Current Password"
                          : field === "newPassword"
                          ? "New Password"
                          : "Confirm Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={
                            field === "currentPassword"
                              ? showCurr
                                ? "text"
                                : "password"
                              : field === "newPassword"
                              ? showNew
                                ? "text"
                                : "password"
                              : showConf
                              ? "text"
                              : "password"
                          }
                          value={passwordData[field]}
                          onChange={(e) =>
                            setPasswordData((p) => ({
                              ...p,
                              [field]: e.target.value,
                            }))
                          }
                          className="w-full border rounded px-3 py-2 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (field === "currentPassword")
                              setShowCurr((v) => !v);
                            if (field === "newPassword") setShowNew((v) => !v);
                            if (field === "confirmPassword")
                              setShowConf((v) => !v);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {(field === "currentPassword" && showCurr) ||
                          (field === "newPassword" && showNew) ||
                          (field === "confirmPassword" && showConf) ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors[field] && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  )
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPwdModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updatePwd}
                    disabled={updatingPwd}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    {updatingPwd ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
