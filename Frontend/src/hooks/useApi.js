import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(options.immediate !== false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (customEndpoint = endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(customEndpoint);
      // Backend returns { status: 'success', data: { ... } } or { status: 'success', data: [...] }
      setData(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error(`Error fetching ${customEndpoint}:`, err);
      // Extract error message from backend AppError structure if available
      const message = err.response?.data?.message || err.message || 'An error occurred while fetching data.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  return { data, loading, error, refetch: fetchData };
}
