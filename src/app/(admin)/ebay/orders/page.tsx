"use client";

import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/button/Button';
import EbayIntegration from '@/components/ebay/EbayIntegration';

interface EbayOrder {
  orderId?: string;
  legacyOrderId?: string;
  creationDate?: string;
  lastModifiedDate?: string;
  orderFulfillmentStatus?: string;
  orderPaymentStatus?: string;
  sellerId?: string;
  buyer?: {
    username?: string;
    email?: string;
    taxAddress?: {
      city?: string;
      stateOrProvince?: string;
      postalCode?: string;
      countryCode?: string;
    };
    buyerRegistrationAddress?: {
      fullName?: string;
      contactAddress?: {
        addressLine1?: string;
        city?: string;
        stateOrProvince?: string;
        postalCode?: string;
        countryCode?: string;
      };
      primaryPhone?: {
        phoneNumber?: string;
      };
      email?: string;
    };
  };
  pricingSummary?: {
    priceSubtotal?: {
      value?: string;
      currency?: string;
    };
    deliveryCost?: {
      value?: string;
      currency?: string;
    };
    total?: {
      value?: string;
      currency?: string;
    };
  };
  lineItems?: Array<{
    lineItemId?: string;
    legacyItemId?: string;
    title?: string;
    lineItemCost?: {
      value?: string;
      currency?: string;
    };
    quantity?: number;
    soldFormat?: string;
    listingMarketplaceId?: string;
    purchaseMarketplaceId?: string;
    lineItemFulfillmentStatus?: string;
    total?: {
      value?: string;
      currency?: string;
    };
  }>;
}

export default function EbayOrdersPage() {
  const [orders, setOrders] = useState<EbayOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [fulfillmentFilter, setFulfillmentFilter] = useState('NOT_STARTED');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const url = fulfillmentFilter 
        ? `/api/ebay/orders?fulfillmentStatus=${fulfillmentFilter}`
        : '/api/ebay/orders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('eBay orders data:', data);
        setOrders(data.orders || []);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to fetch orders';
        setError(errorMessage);
        
        // If it's a refresh token expiration, mark as disconnected
        if (errorMessage.includes('refresh token has expired') || errorMessage.includes('Please reconnect')) {
          setIsConnected(false);
        }
      }
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fulfillmentFilter]);

  useEffect(() => {
    if (isConnected) {
      fetchOrders();
    }
  }, [isConnected, fetchOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">eBay Orders</h1>
          <p className="text-gray-600 mt-2">Manage your eBay orders and fulfillment</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Orders</option>
            <option value="NOT_STARTED">Not Yet Shipped</option>
            <option value="IN_PROGRESS">In Progress Only</option>
            <option value="FULFILLED">Fulfilled</option>
          </select>
          <Button
            onClick={fetchOrders}
            disabled={!isConnected || isLoading}
            variant="outline"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Orders'}
          </Button>
        </div>
      </div>

      {/* eBay Integration */}
      <EbayIntegration onConnectionChange={setIsConnected} />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            {(error.includes('refresh token has expired') || error.includes('Please reconnect')) && (
              <Button
                onClick={() => {
                  setError('');
                  // Trigger eBay reconnection
                  window.location.href = '/api/ebay/auth';
                }}
                variant="outline"
                className="ml-4"
              >
                Reconnect to eBay
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Orders Table */}
      {isConnected ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-600">Orders from your eBay account</p>
          </div>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.buyer?.username || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{order.buyer?.email || order.buyer?.buyerRegistrationAddress?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.lineItems ? order.lineItems.length : 0} item(s)
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.lineItems ? order.lineItems.map(item => item.title || 'Untitled').join(', ') : 'No items'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.pricingSummary?.total?.currency || 'USD'} {order.pricingSummary?.total?.value || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.orderFulfillmentStatus === 'FULFILLED' 
                            ? 'bg-green-100 text-green-800'
                            : order.orderFulfillmentStatus === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.orderFulfillmentStatus === 'NOT_STARTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderFulfillmentStatus || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.creationDate ? new Date(order.creationDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No orders have been fetched from your eBay account yet.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Connect to eBay</h3>
            <p className="mt-1 text-sm text-gray-500">
              Connect your eBay account to view and manage your orders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
