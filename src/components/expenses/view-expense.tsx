"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

interface Expense {
  id: string;
  expense_id: string;
  invoice_id: string;
  item_name: string;
  category: string;
  quantity: number;
  cost: number;
  shipping_cost: number;
  vat: number;
  total_cost: number;
  unit_price: number;
  date: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewExpense() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExpense = useCallback(async () => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        setError('Failed to load expense data');
        setIsLoading(false);
        return;
      }

      const expenseData: Expense = await response.json();
      setExpense(expenseData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching expense:', error);
      setError('Failed to load expense data');
      setIsLoading(false);
    }
  }, [expenseId]);

  useEffect(() => {
    if (expenseId) {
      fetchExpense();
    }
  }, [expenseId, fetchExpense]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expense...</p>
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
          <Button onClick={() => fetchExpense()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Expense Not Found</h3>
          <p className="text-gray-600 mb-4">The requested expense could not be found.</p>
          <Button onClick={() => router.push('/expenses')}>
            Back to Expenses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Details</h1>
          <p className="text-gray-600">Expense ID: {expense.expense_id}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/expenses')}
          >
            Back to List
          </Button>
          <Button
            onClick={() => router.push(`/expenses/edit/${expense.id}`)}
          >
            Edit Expense
          </Button>
        </div>
      </div>

      {/* Expense Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Item Name</dt>
                    <dd className="text-sm text-gray-900 font-medium">{expense.item_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {expense.category}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Invoice ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{expense.invoice_id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(expense.date)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Base Cost</dt>
                    <dd className="text-sm text-gray-900">{formatCurrency(expense.cost)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Shipping Cost</dt>
                    <dd className="text-sm text-gray-900">{formatCurrency(expense.shipping_cost)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">VAT</dt>
                    <dd className="text-sm text-gray-900">{formatCurrency(expense.vat)}</dd>
                  </div>
                  <div className="border-t pt-3">
                    <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
                    <dd className="text-sm text-gray-900 font-semibold">{formatCurrency(expense.total_cost)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                    <dd className="text-sm text-gray-900">{expense.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
                    <dd className="text-sm text-gray-900 font-semibold">{formatCurrency(expense.unit_price)}</dd>
                  </div>
                </dl>
              </div>

              {expense.comment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{expense.comment}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{formatDate(expense.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">{formatDate(expense.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
