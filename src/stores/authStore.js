import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import firebaseServices from '../lib/firebaseServices';
import { notify } from '../lib/notifications';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,

      // Actions
      initialize: async () => {
        set({ isLoading: true });

        // Listen for auth state changes
        const unsubscribe = firebaseServices.auth.onAuthStateChange(async (firebaseUser) => {
          if (firebaseUser) {
            // Get user profile from Firestore
            const result = await firebaseServices.user.getProfile(firebaseUser.uid);
            if (result.success) {
              set({ 
                user: result.data, 
                isAuthenticated: true, 
                role: result.data.role,
                isLoading: false 
              });
            } else {
              set({ user: null, isAuthenticated: false, role: null, isLoading: false });
            }
          } else {
            set({ user: null, isAuthenticated: false, role: null, isLoading: false });
          }
        });

        return unsubscribe;
      },

      register: async (userData, role) => {
        set({ isLoading: true });

        const result = await firebaseServices.auth.register(userData, role);

        if (result.success) {
          set({ 
            user: result.user, 
            isAuthenticated: true, 
            role: result.user.role,
            isLoading: false 
          });
          notify.success('Registration successful! Please check your email for verification.');
        } else {
          set({ isLoading: false });
          notify.error(result.error || 'Registration failed');
        }

        return result;
      },

      login: async (email, password, expectedRole) => {
        set({ isLoading: true });

        const result = await firebaseServices.auth.login(email, password);

        if (result.success) {
          // Check if user has the expected role
          if (expectedRole && result.user.role !== expectedRole) {
            await firebaseServices.auth.logout();
            set({ isLoading: false });
            notify.error(`This login is for ${expectedRole}s only. Please use the correct login page.`);
            return { success: false, error: 'Invalid role for this login page' };
          }

          set({ 
            user: result.user, 
            isAuthenticated: true, 
            role: result.user.role,
            isLoading: false 
          });
          notify.success(`Welcome back, ${result.user.name}!`);
        } else {
          set({ isLoading: false });
          notify.error(result.error || 'Login failed');
        }

        return result;
      },

      logout: async () => {
        const result = await firebaseServices.auth.logout();

        if (result.success) {
          set({ user: null, isAuthenticated: false, role: null });
          notify.success('Logged out successfully');
        } else {
          notify.error(result.error || 'Logout failed');
        }

        return result;
      },

      updateUser: async (updates) => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        const result = await firebaseServices.user.updateProfile(user.uid, updates);

        if (result.success) {
          set({ user: { ...user, ...updates } });
          notify.success('Profile updated successfully');
        } else {
          notify.error(result.error || 'Failed to update profile');
        }

        return result;
      },

      addAddress: async (address) => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        const result = await firebaseServices.user.addAddress(user.uid, address);

        if (result.success) {
          const updatedUser = { ...user };
          if (!updatedUser.addresses) updatedUser.addresses = [];
          updatedUser.addresses.push(result.address);

          set({ user: updatedUser });
          notify.success('Address added successfully');
        } else {
          notify.error(result.error || 'Failed to add address');
        }

        return result;
      },

      updateAddress: async (addressId, updates) => {
        const { user } = get();
        if (!user || !user.addresses) return { success: false, error: 'No addresses found' };

        const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
        if (addressIndex === -1) return { success: false, error: 'Address not found' };

        const updatedAddresses = [...user.addresses];
        updatedAddresses[addressIndex] = { ...updatedAddresses[addressIndex], ...updates };

        const result = await firebaseServices.user.updateProfile(user.uid, { addresses: updatedAddresses });

        if (result.success) {
          set({ user: { ...user, addresses: updatedAddresses } });
          notify.success('Address updated successfully');
        } else {
          notify.error(result.error || 'Failed to update address');
        }

        return result;
      },

      deleteAddress: async (addressId) => {
        const { user } = get();
        if (!user || !user.addresses) return { success: false, error: 'No addresses found' };

        const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
        const result = await firebaseServices.user.updateProfile(user.uid, { addresses: updatedAddresses });

        if (result.success) {
          set({ user: { ...user, addresses: updatedAddresses } });
          notify.success('Address deleted successfully');
        } else {
          notify.error(result.error || 'Failed to delete address');
        }

        return result;
      },

      setDefaultAddress: async (addressId) => {
        const { user } = get();
        if (!user || !user.addresses) return { success: false, error: 'No addresses found' };

        const updatedAddresses = user.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }));

        const result = await firebaseServices.user.updateProfile(user.uid, { addresses: updatedAddresses });

        if (result.success) {
          set({ user: { ...user, addresses: updatedAddresses } });
          notify.success('Default address updated');
        } else {
          notify.error(result.error || 'Failed to set default address');
        }

        return result;
      },

      // Password reset
      resetPassword: async (email) => {
        const result = await firebaseServices.auth.resetPassword(email);

        if (result.success) {
          notify.success('Password reset email sent! Check your inbox.');
        } else {
          notify.error(result.error || 'Failed to send reset email');
        }

        return result;
      }
    }),
    {
      name: 'desigifting-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        role: state.role 
      })
    }
  )
);
