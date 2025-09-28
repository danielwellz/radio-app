import { useState, useEffect, useCallback } from 'react';

export const useOfflineStorage = <T>(key: string, initialValue: T) => {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData(parsed);
        }
        setError(null);
      } catch (e) {
        setError(`Error loading data for key "${key}"`);
        console.error('Error loading offline data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Function to save data
  const saveData = useCallback((newData: T) => {
    try {
      setData(newData);
      localStorage.setItem(key, JSON.stringify(newData));
      setError(null);
    } catch (e) {
      setError(`Error saving data for key "${key}"`);
      console.error('Error saving offline data:', e);
    }
  }, [key]);

  // Function to update data (merge with existing)
  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => {
      const newData = { ...prev as any, ...updates };
      localStorage.setItem(key, JSON.stringify(newData));
      return newData;
    });
  }, [key]);

  // Function to clear data
  const clearData = useCallback(() => {
    setData(initialValue);
    localStorage.removeItem(key);
    setError(null);
  }, [key, initialValue]);

  return { 
    data, 
    saveData, 
    updateData, 
    clearData, 
    isLoading, 
    error 
  };
};

// Specialized hook for channels
export const useChannelsStorage = () => {
  return useOfflineStorage('channels', []);
};

// Specialized hook for favorites
export const useFavoritesStorage = () => {
  return useOfflineStorage('favorites', []);
};

// Specialized hook for user preferences
export const usePreferencesStorage = () => {
  return useOfflineStorage('preferences', {
    theme: 'light',
    volume: 0.8,
    quality: 'high',
    notifications: true
  });
};