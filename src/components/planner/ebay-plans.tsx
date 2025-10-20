"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/button/Button";

interface Plan {
  id: string;
  productName: string;
  unitPrice: number;
  sellPrice: number;
  sourceLink: string;
  shippingCharges: number;
  shippingCost: number;
  status: string;
  profit: number;
  ebayDetails?: {
    ebayLink?: string;
    vat: number;
    ebayCommission: number;
    advertisingPercentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EbayPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/planner/ebay', {
        credentials: 'include',
      });

      if (!response.ok) {
        setError('Failed to load eBay plans');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      // Filter only eBay plans
      const ebayPlans = data.plans?.filter((plan: any) => plan.marketplace === 'ebay') || [];
      setPlans(ebayPlans);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching eBay plans:', error);
      setError('Failed to load eBay plans');
      setIsLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this eBay plan?')) {
      return;
    }

    setDeletingId(planId);
    try {
      const response = await fetch(`/api/planner/ebay/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }

      // Remove the plan from the list
      setPlans(plans.filter(plan => plan.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800";
      case "activated":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading eBay plans...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchPlans}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">eBay Plans</h1>
          <p className="text-gray-600">Manage your eBay product plans</p>
        </div>
        <Link href="/planner/add">
          <Button>
            Add New Plan
          </Button>
        </Link>
      </div>

      {plans.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sell Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {plan.productName}
                      </div>
                      {plan.sourceLink && (
                        <div className="text-xs text-gray-500">
                          <a
                            href={plan.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Source Link
                          </a>
                        </div>
                      )}
                      {plan.ebayDetails?.ebayLink && (
                        <div className="text-xs text-gray-500">
                          <a
                            href={plan.ebayDetails.ebayLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            eBay Link
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(plan.unitPrice))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(plan.sellPrice))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getProfitColor(Number(plan.profit))}>
                        {formatCurrency(Number(plan.profit))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(plan.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/planner/view/${plan.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/planner/edit/${plan.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          disabled={deletingId === plan.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deletingId === plan.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No eBay plans found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first eBay product plan.
          </p>
          <div className="mt-6">
            <Link href="/planner/add">
              <Button>
                Add New Plan
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
