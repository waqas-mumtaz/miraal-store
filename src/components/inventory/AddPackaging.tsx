"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function AddPackaging() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    quantity: "",
    cost: "",
    shipping: "0",
    vat: "0",
    totalCost: "",
    unitCost: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        
        if (quantity > 0 && totalCost > 0) {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!formData.name || !formData.type || !formData.quantity || !formData.cost) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate numeric fields
      const quantity = parseFloat(formData.quantity);
      const cost = parseFloat(formData.cost);

      if (quantity <= 0) {
        setError("Quantity must be greater than 0");
        setIsLoading(false);
        return;
      }

      if (cost <= 0) {
        setError("Cost must be greater than 0");
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

      // Call API to create packaging item
      const response = await fetch('/api/packaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          cost: parseFloat(formData.cost),
          shipping: parseFloat(formData.shipping || 0),
          vat: parseFloat(formData.vat || 0),
          totalCost: parseFloat(formData.totalCost),
          unitCost: parseFloat(formData.unitCost),
        }),
      });

      const data = await response.json();
      console.log('API Response:', response.status, data);

      if (!response.ok) {
        console.error('API Error Response:', data);
        setError(data.error || 'Failed to create packaging item');
        setIsLoading(false);
        return;
      }

      setSuccess("Packaging item created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "",
        quantity: "",
        cost: "",
        shipping: "0",
        vat: "0",
        totalCost: "",
        unitCost: "",
      });

      // Redirect to packaging list after a short delay
      setTimeout(() => {
        router.push("/inventory/packaging");
      }, 2000);

    } catch (error) {
      console.error('Packaging creation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Add Packaging Item
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new packaging item for your inventory
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
            <Label>Packaging Name *</Label>
            <Input
              type="text"
              name="name"
              defaultValue={formData.name}
              onChange={handleInputChange}
              placeholder="Enter packaging name"
            />
          </div>

          <div>
            <Label>Type *</Label>
            <select
              name="type"
              defaultValue={formData.type}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">Select packaging type</option>
              <option value="Box">Box</option>
              <option value="Bubble Wrap">Bubble Wrap</option>
              <option value="Tape">Tape</option>
              <option value="Poly Mailer">Poly Mailer</option>
              <option value="Envelope">Envelope</option>
              <option value="Packing Peanuts">Packing Peanuts</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              name="quantity"
              defaultValue={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              step="1"
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
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <Label>Shipping Cost</Label>
            <Input
              type="number"
              name="shipping"
              defaultValue={formData.shipping}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <Label>VAT</Label>
            <Input
              type="number"
              name="vat"
              defaultValue={formData.vat}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <Label>Total Cost (Auto-calculated)</Label>
            <Input
              type="number"
              name="totalCost"
              defaultValue={formData.totalCost}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled
            />
          </div>

          <div>
            <Label>Unit Cost (Auto-calculated)</Label>
            <Input
              type="number"
              name="unitCost"
              defaultValue={formData.unitCost}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled
            />
          </div>


          <div className="lg:col-span-2">
            <Label>Description</Label>
            <textarea
              name="description"
              defaultValue={formData.description}
              onChange={handleInputChange}
              placeholder="Enter packaging description (optional)"
              className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
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
            {isLoading ? 'Creating...' : 'Create Packaging'}
          </Button>
        </div>
      </form>
    </div>
  );
}
