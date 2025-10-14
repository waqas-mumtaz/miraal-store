"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function AddInventoryItem() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitCost: "",
    linkedProducts: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      if (!formData.name || !formData.unitCost) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate data types
      if (isNaN(parseFloat(formData.unitCost)) || parseFloat(formData.unitCost) <= 0) {
        setError("Unit cost must be a positive number");
        setIsLoading(false);
        return;
      }

      // Parse linked products if provided
      let linkedProducts = [];
      if (formData.linkedProducts.trim()) {
        try {
          linkedProducts = formData.linkedProducts.split(',').map(id => id.trim()).filter(id => id);
        } catch (error) {
          setError("Invalid linked products format. Use comma-separated product IDs.");
          setIsLoading(false);
          return;
        }
      }

      // Call API to create inventory item
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          unitCost: formData.unitCost,
          linkedProducts: linkedProducts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create inventory item');
        setIsLoading(false);
        return;
      }

      setSuccess("Inventory item created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        unitCost: "",
        linkedProducts: "",
      });

      // Redirect to inventory list after a short delay
      setTimeout(() => {
        router.push("/inventory");
      }, 2000);

    } catch (error) {
      console.error('Inventory item creation error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Add Inventory Item
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new inventory item for tracking
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
            <Label>Name *</Label>
            <Input
              type="text"
              name="name"
              defaultValue={formData.name}
              onChange={handleInputChange}
              placeholder="Enter item name"
            />
          </div>

          <div>
            <Label>Unit Cost *</Label>
            <Input
              type="number"
              name="unitCost"
              defaultValue={formData.unitCost}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="lg:col-span-2">
            <Label>Description</Label>
            <textarea
              name="description"
              defaultValue={formData.description}
              onChange={handleInputChange}
              placeholder="Enter item description (optional)"
              className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>

          <div className="lg:col-span-2">
            <Label>Linked Products</Label>
            <Input
              type="text"
              name="linkedProducts"
              defaultValue={formData.linkedProducts}
              onChange={handleInputChange}
              placeholder="Enter product IDs separated by commas (optional)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Example: prod-123, prod-456, prod-789
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
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
            onClick={() => handleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Item'}
          </Button>
        </div>
      </form>
    </div>
  );
}
