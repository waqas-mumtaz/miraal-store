"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useRouter } from "next/navigation";

export default function AddExpense() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    quantity: "",
    totalAmount: "",
    perQuantityCost: "",
    buyLink: "",
    date: "",
    category: "",
    comments: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      // TODO: Call API to create expense
      console.log("Creating expense:", formData);
      
      setSuccess("Expense added successfully!");
      
      // Reset form
      setFormData({
        title: "",
        quantity: "",
        totalAmount: "",
        perQuantityCost: "",
        buyLink: "",
        date: "",
        category: "",
        comments: "",
      });

      // Redirect to expense list after a short delay
      setTimeout(() => {
        router.push("/expenses");
      }, 2000);

    } catch (error) {
      console.error('Expense creation error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Add New Expense
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Record a new expense to track your spending
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
            <Label>Date *</Label>
            <Input
              type="date"
              name="date"
              defaultValue={formData.date}
              onChange={handleInputChange}
            />
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

        <div className="flex items-center gap-3 mt-8 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={(e) => handleSubmit(e)}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
}
