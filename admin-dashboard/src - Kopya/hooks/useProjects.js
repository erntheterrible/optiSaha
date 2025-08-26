import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const useProjects = (customerId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, customer_id')
          .eq('customer_id', customerId)
          .order('name', { ascending: true });
        
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [customerId]);

  return { projects, loading };
};

export default useProjects;
