import toast from 'react-hot-toast';

// Notification service using react-hot-toast
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#ffffff',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#10b981',
      },
      ...options
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#ffffff',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#ef4444',
      },
      ...options
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
      ...options
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        position: 'top-right',
        ...options
      }
    );
  },

  custom: (jsx, options = {}) => {
    return toast.custom(jsx, {
      duration: 4000,
      position: 'top-right',
      ...options
    });
  },

  dismiss: (toastId) => {
    return toast.dismiss(toastId);
  },

  remove: (toastId) => {
    return toast.remove(toastId);
  }
};

// Order status notifications
export const orderNotifications = {
  orderPlaced: (orderId) => {
    notify.success(`Order #${orderId.slice(-8)} placed successfully! 🎉`);
  },

  orderConfirmed: (orderId) => {
    notify.success(`Order #${orderId.slice(-8)} confirmed by seller! ✅`);
  },

  orderShipped: (orderId, tracking) => {
    notify.success(`Order #${orderId.slice(-8)} shipped! ${tracking ? `Tracking: ${tracking}` : ''} 🚚`);
  },

  orderDelivered: (orderId) => {
    notify.success(`Order #${orderId.slice(-8)} delivered! 📦`);
  },

  orderCancelled: (orderId) => {
    notify.error(`Order #${orderId.slice(-8)} has been cancelled ❌`);
  }
};

// Product notifications
export const productNotifications = {
  productAdded: (productName) => {
    notify.success(`${productName} added to your store! 🎁`);
  },

  productUpdated: (productName) => {
    notify.success(`${productName} updated successfully! ✏️`);
  },

  productDeleted: (productName) => {
    notify.success(`${productName} removed from your store 🗑️`);
  },

  productOutOfStock: (productName) => {
    notify.error(`${productName} is out of stock! 📦`);
  }
};

// User notifications
export const userNotifications = {
  profileUpdated: () => {
    notify.success('Profile updated successfully! 👤');
  },

  addressAdded: () => {
    notify.success('Address added successfully! 📍');
  },

  addressUpdated: () => {
    notify.success('Address updated successfully! 📍');
  },

  passwordChanged: () => {
    notify.success('Password changed successfully! 🔒');
  }
};

export default notify;
