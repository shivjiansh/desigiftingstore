// Formatting utility functions

export const formatPrice = (price, currency = 'USD') => {
  if (typeof price !== 'number' || isNaN(price)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const formatOptions = { ...defaultOptions, ...options };

  try {
    // Handle different date formats
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date && typeof date.toDate === 'function') {
      // Firebase Timestamp
      dateObj = date.toDate();
    } else if (date && date.seconds) {
      // Firebase Timestamp object
      dateObj = new Date(date.seconds * 1000);
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('en-US', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return '';

  try {
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date && date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

export const formatNumber = (number, options = {}) => {
  if (typeof number !== 'number' || isNaN(number)) return '0';

  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  const formatOptions = { ...defaultOptions, ...options };

  return new Intl.NumberFormat('en-US', formatOptions).format(number);
};

export const formatCompactNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) return '0';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const capitalizeFirst = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const formatOrderId = (id) => {
  if (!id) return '';
  return `#${id.slice(-8).toUpperCase()}`;
};

export const getRelativeTime = (date) => {
  if (!date) return '';

  try {
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date && date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateObj);
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
};

export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return '';

  // Remove all non-numeric characters
  const cleaned = cardNumber.replace(/\D/g, '');

  // Format as XXXX XXXX XXXX XXXX
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const maskCreditCard = (cardNumber) => {
  if (!cardNumber) return '';

  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cardNumber;

  return '**** **** **** ' + cleaned.slice(-4);
};

export const formatAddress = (address) => {
  if (!address) return '';

  const parts = [
    address.street,
    address.city,
    address.state && address.zipCode ? `${address.state} ${address.zipCode}` : address.state || address.zipCode,
    address.country
  ].filter(Boolean);

  return parts.join(', ');
};

export const formatBusinessHours = (hours) => {
  if (!hours) return '';

  // Expected format: { open: "09:00", close: "17:00" }
  if (hours.open && hours.close) {
    return `${formatTime(hours.open)} - ${formatTime(hours.close)}`;
  }

  return '';
};

export const formatDuration = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

export const formatWeight = (weight, unit = 'kg') => {
  if (typeof weight !== 'number' || weight < 0) return '';

  if (weight < 1) {
    return `${(weight * 1000).toFixed(0)}g`;
  }

  return `${weight.toFixed(weight % 1 === 0 ? 0 : 1)}${unit}`;
};

export const formatDimensions = (length, width, height, unit = 'cm') => {
  const dimensions = [length, width, height].filter(d => typeof d === 'number' && d > 0);

  if (dimensions.length === 0) return '';

  return dimensions.map(d => `${d}${unit}`).join(' × ');
};

// Currency conversion (basic - in production you'd use real exchange rates)
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRates = {}) => {
  if (fromCurrency === toCurrency) return amount;

  // Basic conversion logic
  const rate = exchangeRates[`${fromCurrency}_${toCurrency}`] || 1;
  return amount * rate;
};
