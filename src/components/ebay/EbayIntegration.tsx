"use client";

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { useAuth } from '@/context/AuthContext';

interface EbayIntegrationProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function EbayIntegration({ onConnectionChange }: EbayIntegrationProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if eBay is connected
  useEffect(() => {
    checkEbayConnection();
  }, []);

  const checkEbayConnection = async () => {
    try {
      const response = await fetch('/api/ebay/status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        onConnectionChange?.(data.connected);
      }
    } catch (error) {
      console.error('Error checking eBay connection:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ebay/auth');
      if (response.ok) {
        const data = await response.json();
        // Redirect to eBay OAuth
        window.location.href = data.oauthUrl;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to initiate eBay connection');
      }
    } catch (error) {
      setError('Failed to connect to eBay');
      console.error('eBay connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ebay/disconnect', {
        method: 'POST'
      });

      if (response.ok) {
        setIsConnected(false);
        onConnectionChange?.(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to disconnect from eBay');
      }
    } catch (error) {
      setError('Failed to disconnect from eBay');
      console.error('eBay disconnection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">eBay Integration</h3>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Connected to eBay' : 'Connect your eBay account'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Connect to eBay</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Disconnecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                <span>Disconnect</span>
              </>
            )}
          </Button>
        )}
      </div>

      {isConnected && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            ✅ eBay account connected successfully! You can now sync your listings and orders.
          </p>
        </div>
      )}
    </div>
  );
}
