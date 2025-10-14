"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface Packaging {
  id: string;
  name: string;
  unitCost: number;
}

export default function AddProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    quantity: "",
    cost: "",
    shipping: "0",
    vat: "0",
    totalCost: "",
    type: "FBM",
    linkedPackaging: "",
    packagingCost: "0",
    unitCost: "",
  });
  const [packagingOptions, setPackagingOptions] = useState<Packaging[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch packaging options on component mount
  useEffect(() => {
    const fetchPackaging = async () => {
      try {
        const response = await fetch('/api/packaging', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setPackagingOptions(data.packaging || []);
        }
      } catch (error) {
        console.error('Error fetching packaging:', error);
      }
    };
    fetchPackaging();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Auto-calculate total cost when cost, shipping, or vat changes
      if (name === 'cost' || name === 'shipping' || name === 'vat') {
        const cost = name === 'cost' ? parseFloat(value) : parseFloat(prev.cost);
        const shipping = name === 'shipping' ? parseFloat(value) : parseFloat(prev.shipping);
        const vat = name === 'vat' ? parseFloat(value) : parseFloat(prev.vat);
        
        const totalCost = cost + shipping + vat;
        newData.totalCost = totalCost.toFixed(2);
      }

      // Auto-calculate unit cost when total cost or quantity changes
      if (name === 'totalCost' || name === 'quantity' || name === 'linkedPackaging') {
        const totalCost = name === 'totalCost' ? parseFloat(value) : parseFloat(prev.totalCost);
        const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(prev.quantity);
        const packagingCost = name === 'linkedPackaging' ? 
          (value ? packagingOptions.find(p => p.id === value)?.unitCost || 0 : 0) : 
          parseFloat(prev.packagingCost);
        
        if (quantity > 0 && totalCost > 0) {
          if (prev.type === 'FBM' && packagingCost > 0) {
            newData.unitCost = ((totalCost / quantity) + packagingCost).toFixed(2);
            newData.packagingCost = packagingCost.toString();
          } else {
            newData.unitCost = (totalCost / quantity).toFixed(2);
          }
        } else {
          newData.unitCost = "";
        }
      }

      // Handle type change
      if (name === 'type') {
        if (value === 'FBA') {
          newData.linkedPackaging = "";
          newData.packagingCost = "0";
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
      if (!formData.name || !formData.quantity || !formData.cost || !formData.type) {
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

      // Validate FBM packaging requirement
      if (formData.type === 'FBM' && !formData.linkedPackaging) {
        setError("Please select packaging for FBM products");
        setIsLoading(false);
        return;
      }

      // Call API to create product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          sku: formData.sku,
          quantity: parseInt(formData.quantity),
          cost: parseFloat(formData.cost),
          shipping: parseFloat(formData.shipping),
          vat: parseFloat(formData.vat),
          totalCost: parseFloat(formData.totalCost),
          type: formData.type,
          linkedPackaging: formData.linkedPackaging || null,
          packagingCost: parseFloat(formData.packagingCost),
          unitCost: parseFloat(formData.unitCost),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create product');
        setIsLoading(false);
        return;
      }

      setSuccess("Product created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        sku: "",
        quantity: "",
        cost: "",
        shipping: "0",
        vat: "0",
        totalCost: "",
        type: "FBM",
        linkedPackaging: "",
        packagingCost: "0",
        unitCost: "",
      });

      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push("/inventory/products");
      }, 2000);

    } catch (error) {
      console.error('Product creation error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Add Product
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new product for your inventory
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
            <Label>Product Name *</Label>
            <Input
              type="text"
              name="name"
              defaultValue={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />
          </div>

          <div>
            <Label>SKU</Label>
            <Input
              type="text"
              name="sku"
              defaultValue={formData.sku}
              onChange={handleInputChange}
              placeholder="Enter product SKU (optional)"
            />
          </div>

          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              name="quantity"
              defaultValue={formData.quantity}
              onChange={handleInputChange}
              placeholder="0"
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
            <Label>Shipping</Label>
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
            <Label>Type *</Label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="h-12 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="FBM">FBM (Fulfilled by Merchant)</option>
              <option value="FBA">FBA (Fulfilled by Amazon)</option>
            </select>
          </div>

          {formData.type === 'FBM' && (
            <div>
              <Label>Linked Packaging *</Label>
              <select
                name="linkedPackaging"
                value={formData.linkedPackaging}
                onChange={handleInputChange}
                className="h-12 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="">Select packaging</option>
                {packagingOptions.map((packaging) => (
                  <option key={packaging.id} value={packaging.id}>
                    {packaging.name} (€{packaging.unitCost.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

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
              placeholder="Enter product description (optional)"
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
            {isLoading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
