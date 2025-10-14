"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface Packaging {
  id: string;
  name: string;
  description?: string;
  type: string;
  currentQuantity: number;
  unitCost: number;
  totalCOG: number;
  linkedProducts?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  linkedExpenses: {
    id: string;
    allocatedCost: number;
    expense: {
      id: string;
      title: string;
      date: string;
      totalAmount: number;
    };
  }[];
  replenishments: {
    id: string;
    quantity: number;
    cost: number;
    unitCost: number;
    date: string;
    invoiceLink?: string;
    comments?: string;
    createdAt: string;
  }[];
}

export default function PackagingDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const packagingId = params.id as string;
  const showReplenish = searchParams.get('replenish') === 'true';

  const [packaging, setPackaging] = useState<Packaging | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReplenishForm, setShowReplenishForm] = useState(showReplenish);
  
  // Replenish form state
  const [replenishData, setReplenishData] = useState({
    quantity: "",
    cost: "",
    date: new Date().toISOString().split('T')[0],
    invoiceLink: "",
    comments: "",
  });
  const [isReplenishing, setIsReplenishing] = useState(false);
  const [replenishError, setReplenishError] = useState("");
  const [replenishSuccess, setReplenishSuccess] = useState("");

  useEffect(() => {
    if (packagingId) {
      fetchPackaging();
    }
  }, [packagingId]);

  const fetchPackaging = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/packaging/${packagingId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch packaging item');
        return;
      }

      setPackaging(data.packaging);
    } catch (error) {
      console.error('Packaging fetch error:', error);
      setError('Failed to fetch packaging item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplenishInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReplenishData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (replenishError) setReplenishError("");
    if (replenishSuccess) setReplenishSuccess("");
  };

  const handleReplenish = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsReplenishing(true);
    setReplenishError("");
    setReplenishSuccess("");

    try {
      // Validate form
      if (!replenishData.quantity || !replenishData.cost || !replenishData.date) {
        setReplenishError("Please fill in all required fields");
        setIsReplenishing(false);
        return;
      }

      // Validate data types
      const quantity = parseInt(replenishData.quantity);
      const cost = parseFloat(replenishData.cost);
      
      if (isNaN(quantity) || quantity <= 0) {
        setReplenishError("Quantity must be a positive number");
        setIsReplenishing(false);
        return;
      }

      if (isNaN(cost) || cost <= 0) {
        setReplenishError("Cost must be a positive number");
        setIsReplenishing(false);
        return;
      }

      // Call API to replenish packaging
      const response = await fetch(`/api/packaging/${packagingId}/replenish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: quantity,
          cost: cost,
          date: replenishData.date,
          invoiceLink: replenishData.invoiceLink,
          comments: replenishData.comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReplenishError(data.error || 'Failed to replenish packaging');
        setIsReplenishing(false);
        return;
      }

      setReplenishSuccess("Packaging replenished successfully!");
      
      // Reset form
      setReplenishData({
        quantity: "",
        cost: "",
        date: new Date().toISOString().split('T')[0],
        invoiceLink: "",
        comments: "",
      });

      // Refresh packaging data
      await fetchPackaging();

      // Hide form after success
      setTimeout(() => {
        setShowReplenishForm(false);
        setReplenishSuccess("");
      }, 2000);

    } catch (error) {
      console.error('Replenish error:', error);
      setReplenishError('An unexpected error occurred. Please try again.');
      setIsReplenishing(false);
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
      month: 'short',
      day: 'numeric'
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

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading packaging details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!packaging) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Packaging Item Not Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The requested packaging item could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const quantityStatus = getQuantityStatus(packaging.currentQuantity);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {packaging.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Packaging Details & Inventory Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => setShowReplenishForm(!showReplenishForm)}
          >
            {showReplenishForm ? 'Cancel Replenish' : 'Replenish Stock'}
          </Button>
        </div>
      </div>

      {/* Packaging Information */}
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>Packaging Name</Label>
            <p className="text-sm text-gray-800 dark:text-white/90">{packaging.name}</p>
          </div>
          <div>
            <Label>Type</Label>
            <p className="text-sm text-gray-800 dark:text-white/90">{packaging.type}</p>
          </div>
          {packaging.description && (
            <div>
              <Label>Description</Label>
              <p className="text-sm text-gray-800 dark:text-white/90">{packaging.description}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Current Quantity</Label>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-800 dark:text-white/90">{packaging.currentQuantity}</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${quantityStatus.color}`}>
                {quantityStatus.label}
              </span>
            </div>
          </div>
          <div>
            <Label>Unit Cost</Label>
            <p className="text-sm text-gray-800 dark:text-white/90">{formatCurrency(packaging.unitCost)}</p>
          </div>
          <div>
            <Label>Total COG</Label>
            <p className="text-sm text-gray-800 dark:text-white/90">{formatCurrency(packaging.totalCOG)}</p>
          </div>
          {packaging.linkedProducts && (
            <div>
              <Label>Linked Products</Label>
              <p className="text-sm text-gray-800 dark:text-white/90">{packaging.linkedProducts}</p>
            </div>
          )}
        </div>
      </div>

      {/* Replenish Form */}
      {showReplenishForm && (
        <div className="mt-8 p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <h5 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
            Replenish Stock
          </h5>
          
          {replenishError && (
            <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              {replenishError}
            </div>
          )}

          {replenishSuccess && (
            <div className="mb-4 px-4 py-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              {replenishSuccess}
            </div>
          )}

          <form onSubmit={handleReplenish} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                name="quantity"
                defaultValue={replenishData.quantity}
                onChange={handleReplenishInputChange}
                placeholder="Enter quantity"
                min="1"
              />
            </div>

            <div>
              <Label>Total Cost *</Label>
              <Input
                type="number"
                name="cost"
                defaultValue={replenishData.cost}
                onChange={handleReplenishInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                name="date"
                defaultValue={replenishData.date}
                onChange={handleReplenishInputChange}
              />
            </div>

            <div>
              <Label>Invoice Link</Label>
              <Input
                type="url"
                name="invoiceLink"
                defaultValue={replenishData.invoiceLink}
                onChange={handleReplenishInputChange}
                placeholder="https://drive.google.com/file/d/..."
              />
            </div>

            <div className="lg:col-span-2">
              <Label>Comments</Label>
              <textarea
                name="comments"
                defaultValue={replenishData.comments}
                onChange={handleReplenishInputChange}
                placeholder="Enter any additional comments (optional)"
                className="h-20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReplenishForm(false)}
                disabled={isReplenishing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleReplenish()}
                disabled={isReplenishing}
              >
                {isReplenishing ? 'Replenishing...' : 'Replenish Stock'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Linked Expenses */}
      {packaging.linkedExpenses && packaging.linkedExpenses.length > 0 && (
        <div className="mt-8">
          <h5 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
            Linked Expenses
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Expense</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Total Amount</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Allocated Cost</th>
                </tr>
              </thead>
              <tbody>
                {packaging.linkedExpenses.map((link) => (
                  <tr key={link.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-800 dark:text-white/90">{link.expense.title}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{formatDate(link.expense.date)}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{formatCurrency(link.expense.totalAmount)}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{formatCurrency(link.allocatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Replenishment History */}
      {packaging.replenishments && packaging.replenishments.length > 0 && (
        <div className="mt-8">
          <h5 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
            Replenishment History
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Quantity</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Unit Cost</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Total Cost</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {packaging.replenishments.map((replenishment) => (
                  <tr key={replenishment.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-800 dark:text-white/90">{formatDate(replenishment.date)}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{replenishment.quantity}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{formatCurrency(replenishment.unitCost)}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{formatCurrency(replenishment.cost)}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">
                      {replenishment.invoiceLink ? (
                        <a 
                          href={replenishment.invoiceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:text-brand-600"
                        >
                          View Invoice
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
