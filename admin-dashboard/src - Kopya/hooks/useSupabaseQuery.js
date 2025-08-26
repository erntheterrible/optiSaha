import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Custom hook for handling Supabase queries with loading and error states
 * @param {string} table - The table to query
 * @param {Object} options - Query options
 * @param {Array} [options.select] - Columns to select
 * @param {Object} [options.filters] - Filter conditions
 * @param {string} [options.orderBy] - Column to order by
 * @param {boolean} [options.ascending] - Sort order
 * @param {number} [options.limit] - Maximum number of rows to return
 * @param {boolean} [options.realtime] - Whether to subscribe to real-time updates
 * @param {string} [options.event] - Real-time event type ('*', 'INSERT', 'UPDATE', 'DELETE')
 * @returns {Object} - { data, loading, error, refresh, updateData, setData }
 */
export const useSupabaseQuery = (table, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subscription = useRef(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!table) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value.operator) {
              query = query.filter(key, value.operator, value.value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.ascending !== false 
        });
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data: result, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      if (isMounted.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      console.error(`Error fetching data from ${table}:`, err);
      if (isMounted.current) {
        setError(err);
      }
      return null;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [table, JSON.stringify(options)]);
  
  // Set up real-time subscription if enabled
  useEffect(() => {
    if (options.realtime && table) {
      // Unsubscribe from any existing subscription
      if (subscription.current) {
        supabase.removeChannel(subscription.current);
      }
      
      // Subscribe to changes
      subscription.current = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: options.event || '*',
            schema: 'public',
            table,
          },
          (payload) => {
            if (!isMounted.current) return;
            
            setData(prevData => {
              if (!prevData) return [payload.new];
              
              switch (payload.eventType) {
                case 'INSERT':
                  return [payload.new, ...prevData];
                case 'UPDATE':
                  return prevData.map(item => 
                    item.id === payload.new.id ? { ...item, ...payload.new } : item
                  );
                case 'DELETE':
                  return prevData.filter(item => item.id !== payload.old.id);
                default:
                  return prevData;
              }
            });
          }
        )
        .subscribe();
      
      return () => {
        if (subscription.current) {
          supabase.removeChannel(subscription.current);
        }
      };
    }
  }, [table, options.realtime, options.event]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
    
    return () => {
      isMounted.current = false;
      if (subscription.current) {
        supabase.removeChannel(subscription.current);
      }
    };
  }, [fetchData]);
  
  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);
  
  // Function to update local data (optimistic updates)
  const updateData = useCallback((updater) => {
    setData(prevData => {
      if (typeof updater === 'function') {
        return updater(prevData);
      }
      return updater;
    });
  }, []);
  
  return {
    data,
    loading,
    error,
    refresh,
    updateData,
    setData, // Direct access to setData for more complex cases
  };
};

/**
 * Custom hook for handling a single item query by ID
 * @param {string} table - The table to query
 * @param {string|number} id - The ID of the item to fetch
 * @param {Object} options - Query options
 * @returns {Object} - { data, loading, error, refresh }
 */
export const useSupabaseItem = (table, id, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subscription = useRef(null);
  const isMounted = useRef(true);

  const fetchItem = useCallback(async () => {
    if (!table || id === undefined || id === null) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from(table)
        .select(options.select || '*')
        .eq('id', id)
        .single();
      
      const { data: result, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      if (isMounted.current) {
        setData(result);
      }
      
      return result;
    } catch (err) {
      console.error(`Error fetching item from ${table}:`, err);
      if (isMounted.current) {
        setError(err);
      }
      return null;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [table, id, JSON.stringify(options.select)]);
  
  // Set up real-time subscription if enabled
  useEffect(() => {
    if (options.realtime && table && id) {
      // Unsubscribe from any existing subscription
      if (subscription.current) {
        supabase.removeChannel(subscription.current);
      }
      
      // Subscribe to changes for this specific item
      subscription.current = supabase
        .channel(`${table}-${id}-changes`)
        .on(
          'postgres_changes',
          {
            event: options.event || '*',
            schema: 'public',
            table,
            filter: `id=eq.${id}`,
          },
          (payload) => {
            if (!isMounted.current) return;
            
            setData(prevData => {
              if (payload.eventType === 'DELETE') {
                return null;
              }
              return { ...(prevData || {}), ...payload.new };
            });
          }
        )
        .subscribe();
      
      return () => {
        if (subscription.current) {
          supabase.removeChannel(subscription.current);
        }
      };
    }
  }, [table, id, options.realtime, options.event]);
  
  // Initial fetch
  useEffect(() => {
    fetchItem();
    
    return () => {
      isMounted.current = false;
      if (subscription.current) {
        supabase.removeChannel(subscription.current);
      }
    };
  }, [fetchItem]);
  
  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchItem();
  }, [fetchItem]);
  
  return {
    data,
    loading,
    error,
    refresh,
  };
};
