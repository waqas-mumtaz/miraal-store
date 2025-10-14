"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface ReplenishFormProps {
  inventoryItemId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReplenishForm({ inventoryItemId, onSuccess, onCancel }: ReplenishFormProps) {
  const [formData, setFormData] = useState({
    quantity: "",
    cost: "",
    date: new Date().toISOString().split('T')[0], // Current date as default
    invoiceLink: "",
    comments: "",
    expenseId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();

      if (response.ok) {
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!formData.quantity || !formData.cost || !formData.date) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate data types
      if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
        setError("Quantity must be a positive number");
        setIsLoading(false);
        return;
      }

      if (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) <= 0) {
        setError("Cost must be a positive number");
        setIsLoading(false);
        return;
      }

      // Call API to replenish inventory
      const response = await fetch(`/api/inventory/${inventoryItemId}/replenish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: formData.quantity,
          cost: formData.cost,
          date: formData.date,
          invoiceLink: formData.invoiceLink,
          comments: formData.comments,
          expenseId: formData.expenseId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to replenish inventory');
        setIsLoading(false);
        return;
      }

      setSuccess("Inventory replenished successfully!");
      
      // Reset form
      setFormData({
        quantity: "",
        cost: "",
        date: new Date().toISOString().split('T')[0],
        invoiceLink: "",
        comments: "",
        expenseId: "",
      });

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Replenishment error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Replenish Inventory
      </h5>
      
      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 px-4 py-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              name="quantity"
              defaultValue={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="1"
              step="1"
            />
          </div>

          <div>
            <Label>Total Cost *</Label>
            <Input
              type="number"
              name="cost"
              defaultValue={formData.cost}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
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
            <Label>Invoice Link</Label>
            <Input
              type="url"
              name="invoiceLink"
              defaultValue={formData.invoiceLink}
              onChange={handleInputChange}
              placeholder="https://drive.google.com/file/d/..."
            />
          </div>

          <div className="sm:col-span-2">
            <Label>Link to Expense (Optional)</Label>
            <select
              name="expenseId"
              defaultValue={formData.expenseId}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">Select an expense (optional)</option>
              {expenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  {expense.title} - {new Date(expense.date).toLocaleDateString()} - ${expense.totalAmount}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
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

        <div className="flex items-center gap-3 pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? 'Replenishing...' : 'Replenish Inventory'}
          </Button>
        </div>
      </form>
    </div>
  );
}
