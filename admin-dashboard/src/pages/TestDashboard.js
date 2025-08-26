import React, { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import dashboardService from '../services/dashboardService';

const TestDashboard = () => {
  const { user } = useSupabase();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await dashboardService.testRPCFunctions();
      setTestResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Functions Test</h1>
      <p>Current User ID: {user?.id}</p>
      <button onClick={runTest} disabled={loading}>
        {loading ? 'Testing...' : 'Run Test'}
      </button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {testResults && (
        <div style={{ marginTop: '20px' }}>
          <h3>Test Results:</h3>
          <p>Projects Count (current user): {testResults.projectsCount}</p>
          <p>Leads Count (current user): {testResults.leadsCount}</p>
          <p>Projects Error (current user): {testResults.projectsError?.message || 'None'}</p>
          <p>Leads Error (current user): {testResults.leadsError?.message || 'None'}</p>
          
          <p>Projects Count (sample user): {testResults.projectsCount2}</p>
          <p>Leads Count (sample user): {testResults.leadsCount2}</p>
          <p>Projects Error (sample user): {testResults.projectsError2?.message || 'None'}</p>
          <p>Leads Error (sample user): {testResults.leadsError2?.message || 'None'}</p>
          
          <h4>All Projects:</h4>
          <pre>{JSON.stringify(testResults.allProjects, null, 2)}</pre>
          
          <h4>All Leads:</h4>
          <pre>{JSON.stringify(testResults.allLeads, null, 2)}</pre>
          
          <h4>All Users:</h4>
          <pre>{JSON.stringify(testResults.allUsers, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestDashboard;
