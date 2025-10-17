"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";

interface Invoice {
  id: string;
  invoice_number: string;
}

export default function AddExpense() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    expense_id: "",
    invoice_id: "",
    item_name: "",
    category: "",
    quantity: "",
    cost: "",
    shipping_cost: "0",
    vat: "0",
    total_cost: "0.00",
    unit_price: "0.00",
    date: "",
    comment: "",
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Auto-calculate total cost and unit price
  useEffect(() => {
    const cost = parseFloat(formData.cost || "0");
    const shippingCost = parseFloat(formData.shipping_cost || "0");
    const vat = parseFloat(formData.vat || "0");
    const quantity = parseFloat(formData.quantity || "0");

    const totalCost = cost + shippingCost + vat;
    const unitPrice = quantity > 0 ? totalCost / quantity : 0;

    setFormData(prev => ({
      ...prev,
      total_cost: totalCost.toFixed(2),
      unit_price: unitPrice.toFixed(2),
    }));
  }, [formData.cost, formData.shipping_cost, formData.vat, formData.quantity]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices', {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to load invoices');
        setIsLoadingInvoices(false);
        return;
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
      setIsLoadingInvoices(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setIsLoadingInvoices(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

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
      
      const expense_id = formDataObj.get('expense_id') as string;
      const invoice_id = formDataObj.get('invoice_id') as string;
      const item_name = formDataObj.get('item_name') as string;
      const category = formDataObj.get('category') as string;
      const quantity = formDataObj.get('quantity') as string;
      const cost = formDataObj.get('cost') as string;
      const shipping_cost = formDataObj.get('shipping_cost') as string;
      const vat = formDataObj.get('vat') as string;
      const date = formDataObj.get('date') as string;
      const comment = formDataObj.get('comment') as string;

      // Validate required fields
      if (!expense_id || !invoice_id || !item_name || !category || !quantity || !cost || !date) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate data types
      const quantityNum = parseFloat(quantity);
      const costNum = parseFloat(cost);
      const shippingCostNum = parseFloat(shipping_cost);
      const vatNum = parseFloat(vat);
      
      if (quantityNum <= 0 || costNum < 0 || shippingCostNum < 0 || vatNum < 0) {
        setError("Quantity must be greater than 0 and costs must be non-negative");
        setIsLoading(false);
        return;
      }

      // Calculate totals
      const totalCost = costNum + shippingCostNum + vatNum;
      const unitPrice = totalCost / quantityNum;

      // Prepare request data
      const requestData = {
        expense_id,
        invoice_id,
        item_name,
        category,
        quantity: quantityNum,
        cost: costNum,
        shipping_cost: shippingCostNum,
        vat: vatNum,
        total_cost: totalCost,
        unit_price: unitPrice,
        date,
        comment: comment || null,
      };

      // Call API to create expense
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create expense');
        setIsLoading(false);
        return;
      }

      setSuccess('Expense created successfully!');
      setTimeout(() => {
        router.push('/expenses');
      }, 1500);

    } catch (error) {
      console.error('Create expense error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
        <p className="text-gray-600">Create a new expense record.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label>Expense ID *</Label>
            <Input
              type="text"
              name="expense_id"
              value={formData.expense_id}
              onChange={handleInputChange}
              placeholder="Enter expense ID"
            />
          </div>

          <div>
            <Label>Invoice *</Label>
            <select
              name="invoice_id"
              value={formData.invoice_id}
              onChange={handleInputChange}
              disabled={isLoadingInvoices}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingInvoices ? 'Loading invoices...' : 'Select an invoice'}
              </option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Item Name *</Label>
            <Input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleInputChange}
              placeholder="Enter item name"
            />
          </div>

          <div>
            <Label>Category *</Label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
            >
              <option value="">Select category</option>
              <option value="packaging">Packaging</option>
              <option value="product">Product</option>
              <option value="shipping">Shipping</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="0"
              step={1}
              min="1"
            />
          </div>

          <div>
            <Label>Cost *</Label>
            <Input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>Shipping Cost</Label>
            <Input
              type="number"
              name="shipping_cost"
              value={formData.shipping_cost}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>VAT</Label>
            <Input
              type="number"
              name="vat"
              value={formData.vat}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>Total Cost (€)</Label>
            <Input
              type="text"
              name="total_cost"
              value={formData.total_cost}
              disabled={true}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Unit Price (€)</Label>
            <Input
              type="text"
              name="unit_price"
              value={formData.unit_price}
              disabled={true}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Date *</Label>
            <DatePicker
              id="add-expense-date"
              label=""
              defaultDate={formData.date}
              onChange={(selectedDates) => {
                if (selectedDates.length > 0) {
                  const dateStr = selectedDates[0].toISOString().split('T')[0];
                  setFormData(prev => ({ ...prev, date: dateStr }));
                }
              }}
            />
            {/* Hidden input for form submission */}
            <input
              type="hidden"
              name="date"
              value={formData.date}
            />
          </div>

          <div className="lg:col-span-2">
            <Label>Comment</Label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Enter any additional comments..."
              className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5"
          >
            {isLoading ? 'Creating...' : 'Create Expense'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/expenses')}
            disabled={isLoading}
            className="px-6 py-2.5"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
