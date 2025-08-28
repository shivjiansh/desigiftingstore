import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "../stores/authStore";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    sellerLogin,
    register,
    logout,
    updateUser,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    resetPassword,
    initialize,
  } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    sellerLogin,
    register,
    logout,
    updateUser,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    resetPassword,
  };
};

export const useAuthGuard = (redirectTo = "/") => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/buyer/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};

export const useGuestOnly = (redirectTo = "/") => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Simple redirect for authenticated users
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Simplified guards - just check authentication
export const useRequireAuth = (redirectTo = "/buyer/auth/login") => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};
