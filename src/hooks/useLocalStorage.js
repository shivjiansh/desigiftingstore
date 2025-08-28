import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing recent searches
export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useLocalStorage('desigifting-recent-searches', []);

  const addRecentSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return;

    const trimmedSearch = searchTerm.trim();
    setRecentSearches(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== trimmedSearch);
      // Add to beginning and limit to 10 items
      return [trimmedSearch, ...filtered].slice(0, 10);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  };
};

// Hook for managing user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('desigifting-user-preferences', {
    theme: 'light',
    currency: 'USD',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showProfile: false,
      allowMessages: true
    }
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedPreference = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return {
    preferences,
    updatePreference,
    updateNestedPreference
  };
};
