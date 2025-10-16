"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  shipping?: number;
  vat?: number;
  totalCost?: number;
  linkedProducts?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditPackaging() {
  const params = useParams();
  const router = useRouter();
  const packagingId = params.id as string;

  const [packaging, setPackaging] = useState<Packaging | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    quantity: "",
    cost: "",
    unitCost: "",
    shipping: "",
    vat: "",
    totalCost: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (packagingId) {
      fetchPackaging();
    }
  }, [packagingId]);

  const fetchPackaging = async () => {
    try {
      setIsFetching(true);
      setError("");

      const response = await fetch(`/api/packaging/${packagingId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch packaging item');
        return;
      }

      setPackaging(data.packaging);
      setFormData({
        name: data.packaging.name,
        description: data.packaging.description || "",
        type: data.packaging.type,
        quantity: data.packaging.quantity?.toString() || "",
        cost: data.packaging.cost?.toString() || "",
        unitCost: data.packaging.unitCost.toString(),
        shipping: data.packaging.shipping?.toString() || "",
        vat: data.packaging.vat?.toString() || "",
        totalCost: data.packaging.totalCost?.toString() || "",
      });
    } catch (error) {
      console.error('Packaging fetch error:', error);
      setError('Failed to fetch packaging item');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // For auto-calculation, we need to get current values from the form
    setTimeout(() => {
      const form = e.target.form;
      if (!form) return;
      
      // Get current values directly from form fields
      const costField = form.querySelector('input[name="cost"]') as HTMLInputElement;
      const shippingField = form.querySelector('input[name="shipping"]') as HTMLInputElement;
      const vatField = form.querySelector('input[name="vat"]') as HTMLInputElement;
      const quantityField = form.querySelector('input[name="quantity"]') as HTMLInputElement;
      
      const cost = parseFloat(costField?.value) || 0;
      const shipping = parseFloat(shippingField?.value) || 0;
      const vat = parseFloat(vatField?.value) || 0;
      const quantity = parseFloat(quantityField?.value) || 0;
      
      // Auto-calculate total cost when cost, shipping, or vat changes
      if (name === 'cost' || name === 'shipping' || name === 'vat') {
        const totalCost = cost + shipping + vat;
        const totalCostField = form.querySelector('input[name="totalCost"]') as HTMLInputElement;
        if (totalCostField) {
          totalCostField.value = totalCost.toFixed(2);
        }
      }
      
      // Auto-calculate unit cost when total cost or quantity changes
      if (name === 'totalCost' || name === 'quantity' || name === 'cost' || name === 'shipping' || name === 'vat') {
        const totalCostField = form.querySelector('input[name="totalCost"]') as HTMLInputElement;
        const totalCost = parseFloat(totalCostField?.value) || 0;
        
        if (quantity > 0 && totalCost > 0) {
          const unitCost = totalCost / quantity;
          const unitCostField = form.querySelector('input[name="unitCost"]') as HTMLInputElement;
          if (unitCostField) {
            unitCostField.value = unitCost.toFixed(2);
          }
        }
      }
    }, 0);
    
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
      // Get current form values
      const form = e?.target as HTMLFormElement || document.querySelector('form');
      if (!form) {
        setError("Form not found");
        setIsLoading(false);
        return;
      }

      const formData = new FormData(form);
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const type = formData.get('type') as string;
      const quantity = formData.get('quantity') as string;
      const cost = formData.get('cost') as string;
      const shipping = formData.get('shipping') as string;
      const vat = formData.get('vat') as string;
      
      // Get disabled fields directly from DOM
      const unitCostField = form.querySelector('input[name="unitCost"]') as HTMLInputElement;
      const totalCostField = form.querySelector('input[name="totalCost"]') as HTMLInputElement;
      const unitCost = unitCostField?.value || '';
      const totalCost = totalCostField?.value || '';

      // Validate form
      if (!name || !type || !unitCost) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate data types
      if (isNaN(parseFloat(unitCost)) || parseFloat(unitCost) <= 0) {
        setError("Unit cost must be a positive number");
        setIsLoading(false);
        return;
      }

      // Call API to update packaging
      const response = await fetch(`/api/packaging/${packagingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          type,
          quantity,
          cost,
          unitCost,
          shipping,
          vat,
          totalCost,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update packaging item');
        setIsLoading(false);
        return;
      }

      setSuccess("Packaging item updated successfully!");
      
      // Redirect to packaging list after a short delay
      setTimeout(() => {
        router.push("/inventory/packaging");
      }, 2000);

    } catch (error) {
      console.error('Packaging update error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isFetching) {
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

  if (error && !packaging) {
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading packaging details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Edit Packaging Item
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update packaging information
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
            <Label>Unit Cost *</Label>
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
            <Label>Shipping Cost</Label>
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
            <Label>VAT</Label>
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
            {isLoading ? 'Updating...' : 'Update Packaging'}
          </Button>
        </div>
      </form>
    </div>
  );
}
