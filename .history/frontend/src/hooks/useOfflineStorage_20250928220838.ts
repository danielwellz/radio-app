import { useState, useEffect, useCallback } from 'react';

export const useOfflineStorage = <T>(key: string, initialValue: T) => {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error(`Error parsing stored data for key "${key}":`, e);
      }
    }
    setIsLoading(false);
  }, [key]);

  // Function to save data
  const saveData = useCallback((newData: T) => {
    setData(newData);
    localStorage.setItem(key, JSON.stringify(newData));
  }, [key]);

  return { data, saveData, isLoading };
};