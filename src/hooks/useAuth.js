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
    signInWithGoogle, // Add this to your store
  } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Wrapper function for Google Sign-In
  const googleSignIn = async (userType = "buyer") => {
    try {
      const result = await signInWithGoogle(userType);
      return result;
    } catch (error) {
      console.error("Google sign-in error:", error);
      return {
        success: false,
        error: error.message || "Google sign-in failed. Please try again.",
      };
    }
  };

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
    signInWithGoogle: googleSignIn, // Export the wrapper
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
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

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

// Additional hook for seller authentication
export const useSellerAuth = (redirectTo = "/seller/auth/login") => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== "seller")) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo]);

  return { isAuthenticated, isLoading, isSeller: user?.userType === "seller" };
};

// Additional hook for buyer authentication
export const useBuyerAuth = (redirectTo = "/buyer/auth/login") => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== "buyer")) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo]);

  return { isAuthenticated, isLoading, isBuyer: user?.userType === "buyer" };
};
