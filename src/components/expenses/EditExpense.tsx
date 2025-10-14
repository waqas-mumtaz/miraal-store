"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface Expense {
  id: string;
  title: string;
  quantity: number;
  totalAmount: number;
  perQuantityCost: number;
  buyLink?: string;
  invoiceLink?: string;
  date: string;
  category: string;
  comments?: string;
}

export default function EditExpense() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    quantity: "",
    totalAmount: "",
    perQuantityCost: "",
    buyLink: "",
    date: "",
    category: "",
    invoiceLink: "",
    comments: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (expenseId) {
      fetchExpense();
    }
  }, [expenseId]);

  const fetchExpense = async () => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch expense');
        return;
      }

      const expense = data.expense;
      setFormData({
        title: expense.title || "",
        quantity: expense.quantity?.toString() || "",
        totalAmount: expense.totalAmount?.toString() || "",
        perQuantityCost: expense.perQuantityCost?.toString() || "",
        buyLink: expense.buyLink || "",
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : "",
        category: expense.category || "",
        invoiceLink: expense.invoiceLink || "",
        comments: expense.comments || "",
      });
    } catch (error) {
      console.error('Error fetching expense:', error);
      setError('Failed to fetch expense');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-calculate per quantity cost when quantity or total amount changes
      if (name === 'quantity' || name === 'totalAmount') {
        const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(prev.quantity);
        const totalAmount = name === 'totalAmount' ? parseFloat(value) : parseFloat(prev.totalAmount);
        
        if (quantity > 0 && totalAmount > 0) {
          newData.perQuantityCost = (totalAmount / quantity).toFixed(2);
        } else {
          newData.perQuantityCost = "";
        }
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!formData.title || !formData.quantity || !formData.totalAmount || !formData.category || !formData.date) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Call API to update expense
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          quantity: formData.quantity,
          totalAmount: formData.totalAmount,
          perQuantityCost: formData.perQuantityCost,
          buyLink: formData.buyLink,
          invoiceLink: formData.invoiceLink,
          date: formData.date,
          category: formData.category,
          comments: formData.comments,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update expense');
        setIsLoading(false);
        return;
      }

      setSuccess("Expense updated successfully!");
      
      // Redirect to expense list after a short delay
      setTimeout(() => {
        router.push("/expenses");
      }, 2000);

    } catch (error) {
      console.error('Expense update error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Edit Expense
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update the expense details below
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 px-4 py-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label>Title *</Label>
            <Input
              type="text"
              name="title"
              defaultValue={formData.title}
              onChange={handleInputChange}
              placeholder="Enter expense title"
            />
          </div>

          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              name="quantity"
              defaultValue={formData.quantity}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              step={1}
            />
          </div>

          <div>
            <Label>Total Amount *</Label>
            <Input
              type="number"
              name="totalAmount"
              defaultValue={formData.totalAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>Per Quantity Cost</Label>
            <Input
              type="number"
              name="perQuantityCost"
              defaultValue={formData.perQuantityCost}
              placeholder="Auto-calculated"
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <Label>Buy Link</Label>
            <Input
              type="url"
              name="buyLink"
              defaultValue={formData.buyLink}
              onChange={handleInputChange}
              placeholder="https://example.com/product"
            />
          </div>

          <div>
            <Label>Invoice Link (Google Drive)</Label>
            <Input
              type="url"
              name="invoiceLink"
              defaultValue={formData.invoiceLink}
              onChange={handleInputChange}
              placeholder="https://drive.google.com/file/d/..."
            />
          </div>

          <div>
            <Label>Date *</Label>
            <div className="relative">
              <Input
                type="date"
                name="date"
                defaultValue={formData.date}
                onChange={handleInputChange}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <Label>Category *</Label>
            <select
              name="category"
              defaultValue={formData.category}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">Select category</option>
              <option value="Packaging">Packaging</option>
              <option value="Office supplies">Office supplies</option>
              <option value="Marketing">Marketing</option>
              <option value="Shipping">Shipping</option>
              <option value="Inventory">Inventory</option>
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="Utilities">Utilities</option>
              <option value="Professional services">Professional services</option>
              <option value="Travel">Travel</option>
              <option value="Training">Training</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <Label>Comments</Label>
            <textarea
              name="comments"
              defaultValue={formData.comments}
              onChange={handleInputChange}
              placeholder="Enter any additional comments (optional)"
              className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/expenses")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={(e: React.MouseEvent) => handleSubmit(e as any)}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
}
