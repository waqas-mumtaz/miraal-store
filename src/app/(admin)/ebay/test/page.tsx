"use client";

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';

export default function EbayTestPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkDebugInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ebay/debug');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      const response = await fetch('/api/ebay/auth');
      if (response.ok) {
        const data = await response.json();
        // Redirect to eBay Auth
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  useEffect(() => {
    checkDebugInfo();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">eBay Integration Test</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          <Button onClick={checkDebugInfo} disabled={isLoading} className="mb-4">
            {isLoading ? 'Loading...' : 'Refresh Debug Info'}
          </Button>
          
          {debugInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test eBay Authentication</h2>
          <Button onClick={testAuth} className="bg-blue-600 hover:bg-blue-700">
            Test eBay Auth Flow
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            This will redirect you to eBay for authentication. After completing the auth flow, 
            you should be redirected back to the eBay orders page.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
            <div><strong>VERCEL_URL:</strong> {process.env.VERCEL_URL || 'Not set'}</div>
            <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server side'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
