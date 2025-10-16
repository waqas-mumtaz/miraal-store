"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface ReplenishPackagingProps {
  packagingId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReplenishPackaging({ packagingId, onSuccess, onCancel }: ReplenishPackagingProps) {
  const [formData, setFormData] = useState({
    quantity: "",
    cost: "",
    shipping: "0",
    vat: "0",
    totalCost: "",
    unitCost: "",
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
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Auto-calculate total cost when cost, shipping, or vat changes
      if (name === 'cost' || name === 'shipping' || name === 'vat') {
        const cost = name === 'cost' ? parseFloat(value) : parseFloat(prev.cost);
        const shipping = name === 'shipping' ? parseFloat(value) : parseFloat(prev.shipping);
        const vat = name === 'vat' ? parseFloat(value) : parseFloat(prev.vat);
        
        const totalCost = cost + shipping + vat;
        newData.totalCost = totalCost.toFixed(2);
      }

      // Auto-calculate unit cost when total cost or quantity changes
      if (name === 'totalCost' || name === 'quantity' || name === 'cost' || name === 'shipping' || name === 'vat') {
        const totalCost = name === 'totalCost' ? parseFloat(value) : parseFloat(newData.totalCost);
        const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(prev.quantity);
        
        if (quantity > 0) {
          newData.unitCost = (totalCost / quantity).toFixed(2);
        } else {
          newData.unitCost = "";
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
      // Get current form values from DOM
      const form = e.currentTarget as HTMLFormElement;
      const formDataObj = new FormData(form);
      
      const quantity = formDataObj.get('quantity') as string;
      const cost = formDataObj.get('cost') as string;
      const shipping = formDataObj.get('shipping') as string;
      const vat = formDataObj.get('vat') as string;
      const date = formDataObj.get('date') as string;
      const invoiceLink = formDataObj.get('invoiceLink') as string;
      const comments = formDataObj.get('comments') as string;
      const expenseId = formDataObj.get('expenseId') as string;

      // Validate form - check for empty strings, not falsy values (0 is valid)
      if (!quantity || !cost || shipping === "" || vat === "" || !date) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate data types
      const quantityNum = parseInt(quantity);
      const costNum = parseFloat(cost);
      const shippingNum = parseFloat(shipping);
      const vatNum = parseFloat(vat);
      
      // Calculate total cost and unit cost
      const totalCostNum = costNum + shippingNum + vatNum;
      const unitCostNum = quantityNum > 0 ? totalCostNum / quantityNum : 0;
      
      if (isNaN(quantityNum) || quantityNum <= 0) {
        setError("Quantity must be a positive number");
        setIsLoading(false);
        return;
      }
      
      if (isNaN(costNum) || costNum < 0) {
        setError("Cost must be a non-negative number");
        setIsLoading(false);
        return;
      }

      if (isNaN(shippingNum) || shippingNum < 0) {
        setError("Shipping must be a non-negative number");
        setIsLoading(false);
        return;
      }

      if (isNaN(vatNum) || vatNum < 0) {
        setError("VAT must be a non-negative number");
        setIsLoading(false);
        return;
      }

      // Prepare data to send
      const requestData = {
        quantity: quantityNum,
        cost: costNum,
        shipping: shippingNum,
        vat: vatNum,
        totalCost: totalCostNum,
        unitCost: unitCostNum,
        date: date,
        invoiceLink: invoiceLink || "",
        comments: comments || "",
        expenseId: expenseId || null,
      };


      // Call API to replenish packaging
      const response = await fetch(`/api/packaging/${packagingId}/replenish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to replenish packaging');
        setIsLoading(false);
        return;
      }

      setSuccess('Packaging replenished successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Replenish error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Replenish Packaging
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add new stock to this packaging item
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              name="quantity"
              defaultValue={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              step={1}
              min="1"
            />
          </div>

          <div>
            <Label>Cost *</Label>
            <Input
              type="number"
              name="cost"
              defaultValue={formData.cost}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>Shipping *</Label>
            <Input
              type="number"
              name="shipping"
              defaultValue={formData.shipping}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>VAT *</Label>
            <Input
              type="number"
              name="vat"
              defaultValue={formData.vat}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>Total Cost</Label>
            <Input
              type="number"
              name="totalCost"
              defaultValue={formData.totalCost}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
              disabled
            />
          </div>

          <div>
            <Label>Unit Cost</Label>
            <Input
              type="number"
              name="unitCost"
              defaultValue={formData.unitCost}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
              disabled
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              name="date"
              defaultValue={formData.date}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Invoice Link</Label>
            <Input
              type="url"
              name="invoiceLink"
              defaultValue={formData.invoiceLink}
              onChange={handleInputChange}
              placeholder="https://example.com/invoice"
            />
          </div>

          <div>
            <Label>Link to Expense (Optional)</Label>
            <select
              name="expenseId"
              value={formData.expenseId}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">Select an expense (optional)</option>
              {expenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  {expense.title} - {new Date(expense.date).toLocaleDateString()} - €{expense.totalAmount}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Comments</Label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            placeholder="Add any additional notes..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            {isLoading ? 'Replenishing...' : 'Replenish Packaging'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
