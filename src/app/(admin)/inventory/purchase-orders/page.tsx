"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

interface PurchaseOrderItem {
  id: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  notes?: string;
  packagingItem: {
    id: string;
    name: string;
    type: string;
  };
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
  totalCost: number;
  supplier?: string;
  notes?: string;
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPurchaseOrders = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/purchase-orders?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch purchase orders');
      }
    } catch (error) {
      setError('Failed to fetch purchase orders');
      console.error('Error fetching purchase orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shipped' },
      RECEIVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Received' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalItems = (items: PurchaseOrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowViewModal(true);
  };

  const handleUpdateStatus = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setNewStatus(po.status);
    setShowStatusModal(true);
  };

  const updatePOStatus = async () => {
    if (!selectedPO || !newStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/purchase-orders/${selectedPO.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh the purchase orders list
        await fetchPurchaseOrders();
        
        // Show success message with specific actions for RECEIVED status
        if (newStatus === 'RECEIVED') {
          setSuccessMessage(`✅ Purchase Order ${selectedPO.poNumber} marked as RECEIVED! Stock levels updated and expenses created automatically.`);
        } else {
          setSuccessMessage(`✅ Purchase Order ${selectedPO.poNumber} status updated to ${newStatus}.`);
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
        
        setShowStatusModal(false);
        setSelectedPO(null);
        setNewStatus('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      setError('Failed to update status');
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-2">Manage your packaging replenishment orders</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/inventory/packaging/replenish')}
          >
            Create New PO
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="RECEIVED">Received</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setStatusFilter('all')}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total POs</p>
            <p className="text-2xl font-semibold text-gray-900">{purchaseOrders.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="flex-shrink-0 bg-yellow-100 text-yellow-600 rounded-full p-3">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-semibold text-gray-900">
              {purchaseOrders.filter(po => po.status === 'PENDING').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-semibold text-gray-900">
              {purchaseOrders.filter(po => po.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="flex-shrink-0 bg-purple-100 text-purple-600 rounded-full p-3">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Value</p>
            <p className="text-2xl font-semibold text-gray-900">
              €{purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Purchase Orders</h2>
          <p className="text-sm text-gray-600">All packaging replenishment orders</p>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading purchase orders...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : purchaseOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{po.poNumber}</div>
                      {po.supplier && (
                        <div className="text-sm text-gray-500">Supplier: {po.supplier}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTotalItems(po.items)} items
                      </div>
                      <div className="text-sm text-gray-500">
                        {po.items.map(item => item.packagingItem.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{po.totalCost.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(po.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {po.expectedDelivery ? formatDate(po.expectedDelivery) : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewPO(po)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(po)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Update Status
                        </button>
                      </div>
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first purchase order to replenish packaging stock.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push('/inventory/packaging/replenish')}
                >
                  Create Purchase Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View PO Modal */}
      {showViewModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Purchase Order Details - {selectedPO.poNumber}
                </h2>
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPO(null);
                  }}
                  variant="outline"
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PO Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">PO Number:</span>
                        <span className="font-medium">{selectedPO.poNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedPO.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-medium">€{selectedPO.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium">{formatDate(selectedPO.orderDate)}</span>
                      </div>
                      {selectedPO.expectedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Delivery:</span>
                          <span className="font-medium">{formatDate(selectedPO.expectedDelivery)}</span>
                        </div>
                      )}
                      {selectedPO.supplier && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="font-medium">{selectedPO.supplier}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPO.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                      <p className="text-sm text-gray-600">{selectedPO.notes}</p>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedPO.items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-3 border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.packagingItem.name}</h4>
                              <p className="text-sm text-gray-500 capitalize">{item.packagingItem.type.toLowerCase()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">€{item.totalCost.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">{item.quantity} × €{item.unitCost.toFixed(2)}</p>
                            </div>
                          </div>
                          {item.supplier && (
                            <p className="text-xs text-gray-500 mt-1">Supplier: {item.supplier}</p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Status - {selectedPO.poNumber}
                </h2>
                <Button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedPO(null);
                    setNewStatus('');
                  }}
                  variant="outline"
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="RECEIVED">Received</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Info about RECEIVED status */}
                {newStatus === 'RECEIVED' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">When marked as RECEIVED:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>Stock levels will be automatically updated</li>
                          <li>Expense entries will be created automatically</li>
                          <li>Delivery date will be set to today</li>
                          <li>Packaging items will be marked as ACTIVE</li>
                          <li>You can now use these items for orders</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={updatePOStatus}
                    disabled={isUpdating || newStatus === selectedPO.status}
                    className="flex-1"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedPO(null);
                      setNewStatus('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
