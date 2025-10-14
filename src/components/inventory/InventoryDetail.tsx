"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReplenishForm from "./ReplenishForm";

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  currentQuantity: number;
  unitCost: number;
  linkedProducts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  replenishments: {
    id: string;
    quantity: number;
    cost: number;
    unitCost: number;
    date: string;
    invoiceLink?: string;
    comments?: string;
    createdAt: string;
    expense?: {
      id: string;
      title: string;
      date: string;
    };
  }[];
}

export default function InventoryDetail() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReplenishForm, setShowReplenishForm] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchInventoryItem();
    }
  }, [itemId]);

  // Check if replenish parameter is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('replenish') === 'true') {
      setShowReplenishForm(true);
    }
  }, []);

  const fetchInventoryItem = async () => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch inventory item');
        return;
      }

      setInventoryItem(data.inventoryItem);
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      setError('Failed to fetch inventory item');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuantityStatus = (quantity: number) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' };
    } else if (quantity <= 10) {
      return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' };
    } else {
      return { label: 'In Stock', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' };
    }
  };

  const handleReplenishSuccess = () => {
    setShowReplenishForm(false);
    fetchInventoryItem(); // Refresh data
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!inventoryItem) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Inventory item not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The inventory item you're looking for doesn't exist.
          </p>
          <Link
            href="/inventory"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const status = getQuantityStatus(inventoryItem.currentQuantity);
  const totalValue = inventoryItem.currentQuantity * inventoryItem.unitCost;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {inventoryItem.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inventory item details and replenishment history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReplenishForm(!showReplenishForm)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showReplenishForm ? 'Cancel' : 'Replenish'}
          </button>
          <Link
            href={`/inventory/edit/${inventoryItem.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
        </div>
      </div>

      {/* Replenish Form */}
      {showReplenishForm && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <ReplenishForm
            inventoryItemId={inventoryItem.id}
            onSuccess={handleReplenishSuccess}
            onCancel={() => setShowReplenishForm(false)}
          />
        </div>
      )}

      {/* Item Details */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Item Information
            </h5>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <p className="text-gray-900 dark:text-white">{inventoryItem.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Quantity
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {inventoryItem.currentQuantity}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit Cost
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatCurrency(inventoryItem.unitCost)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Value
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Linked Products
                </label>
                <p className="text-gray-900 dark:text-white">
                  {inventoryItem.linkedProducts.length} product{inventoryItem.linkedProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {inventoryItem.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white">{inventoryItem.description}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h5>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Replenishments</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {inventoryItem.replenishments.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Invested</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(inventoryItem.replenishments.reduce((sum, r) => sum + r.cost, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Unit Cost</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {inventoryItem.replenishments.length > 0 
                    ? formatCurrency(inventoryItem.replenishments.reduce((sum, r) => sum + r.unitCost, 0) / inventoryItem.replenishments.length)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replenishment History */}
      <div className="mt-6">
        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Replenishment History
        </h5>
        {inventoryItem.replenishments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No replenishments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Unit Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Total Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Expense</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Comments</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItem.replenishments.map((replenishment) => (
                  <tr key={replenishment.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      {formatDate(replenishment.date)}
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      +{replenishment.quantity}
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      {formatCurrency(replenishment.unitCost)}
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                      {formatCurrency(replenishment.cost)}
                    </td>
                    <td className="py-4 px-4">
                      {replenishment.expense ? (
                        <Link
                          href={`/expenses/edit/${replenishment.expense.id}`}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm"
                        >
                          {replenishment.expense.title}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">Not linked</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                      {replenishment.comments || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
