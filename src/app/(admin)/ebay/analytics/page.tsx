"use client";

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import EbayIntegration from '@/components/ebay/EbayIntegration';

interface EbayAnalytics {
  salesAnalytics: {
    totalSales: number;
    totalTransactions: number;
    averageOrderValue: number;
    topSellingItems: Array<{
      itemId: string;
      title: string;
      quantitySold: number;
      revenue: number;
    }>;
  };
  performanceMetrics: {
    sellerStandards: {
      level: string;
      score: number;
    };
    defectRate: number;
    lateShipmentRate: number;
    returnRate: number;
  };
  dateRange: {
    from: string;
    to: string;
  };
}

export default function EbayAnalyticsPage() {
  const [analytics, setAnalytics] = useState<EbayAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        metrics: 'SALES,TRANSACTION'
      });

      const response = await fetch(`/api/ebay/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      setError('Failed to fetch analytics');
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchAnalytics();
    }
  }, [isConnected, dateRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">eBay Analytics</h1>
          <p className="text-gray-600 mt-2">View your eBay sales performance and insights</p>
        </div>
        <div className="flex space-x-3">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <Button
            onClick={fetchAnalytics}
            disabled={!isConnected || isLoading}
            variant="outline"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Analytics'}
          </Button>
        </div>
      </div>

      {/* eBay Integration */}
      <EbayIntegration onConnectionChange={setIsConnected} />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Analytics Dashboard */}
      {isConnected && analytics ? (
        <div className="space-y-6">
          {/* Sales Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${analytics.salesAnalytics.totalSales.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics.salesAnalytics.totalTransactions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Average Order Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${analytics.salesAnalytics.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Seller Level</p>
                <p className="text-xl font-semibold text-gray-900">
                  {analytics.performanceMetrics.sellerStandards.level}
                </p>
                <p className="text-sm text-gray-500">
                  Score: {analytics.performanceMetrics.sellerStandards.score}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Defect Rate</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(analytics.performanceMetrics.defectRate * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Late Shipment Rate</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(analytics.performanceMetrics.lateShipmentRate * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Return Rate</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(analytics.performanceMetrics.returnRate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          {analytics.salesAnalytics.topSellingItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.salesAnalytics.topSellingItems.map((item, index) => (
                      <tr key={item.itemId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.itemId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantitySold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${item.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : isConnected ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Connect to eBay</h3>
            <p className="mt-1 text-sm text-gray-500">
              Connect your eBay account to view detailed analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}