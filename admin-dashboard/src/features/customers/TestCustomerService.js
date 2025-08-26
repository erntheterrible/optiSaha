import React, { useEffect, useState } from 'react';
import customerService from '../../services/customerService';

const TestCustomerService = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testService = async () => {
      try {
        setLoading(true);
        console.log('Testing customer service...');
        const data = await customerService.getCustomers({});
        console.log('Customer service test result:', data);
        setResult(data);
      } catch (err) {
        console.error('Customer service test failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testService();
  }, []);

  return (
    <div>
      <h2>Customer Service Test</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result && (
        <div>
          <p>Count: {result.count}</p>
          <p>Data length: {result.data?.length}</p>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestCustomerService;
