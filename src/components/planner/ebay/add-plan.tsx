"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

interface PlanFormData {
  productName: string;
  unitPrice: string | number;
  sellPrice: string | number;
  sourceLink: string;
  ebayLink: string;
  vat: string | number;
  ebayCommission: number;
  shippingCharges: string | number;
  shippingCost: string | number;
  status: string;
}

export default function AddPlan() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profit, setProfit] = useState(0);

  const [formData, setFormData] = useState<PlanFormData>({
    productName: "",
    unitPrice: "",
    sellPrice: "",
    sourceLink: "",
    ebayLink: "",
    vat: "",
    ebayCommission: 15,
    shippingCharges: "",
    shippingCost: "",
    status: "planned",
  });

  const calculateProfit = (data: PlanFormData) => {
    const sellPrice = typeof data.sellPrice === 'string' ? parseFloat(data.sellPrice) || 0 : data.sellPrice;
    const shippingCharges = typeof data.shippingCharges === 'string' ? parseFloat(data.shippingCharges) || 0 : data.shippingCharges;
    const vat = typeof data.vat === 'string' ? parseFloat(data.vat) || 0 : data.vat;
    const shippingCost = typeof data.shippingCost === 'string' ? parseFloat(data.shippingCost) || 0 : data.shippingCost;
    const unitPrice = typeof data.unitPrice === 'string' ? parseFloat(data.unitPrice) || 0 : data.unitPrice;
    
    const totalRevenue = sellPrice + shippingCharges;
    const netRevenue = totalRevenue / (1 + vat / 100);
    const ebayCommissionAmount = (totalRevenue * data.ebayCommission) / 100;
    const totalCosts = ebayCommissionAmount + shippingCost + unitPrice;
    return netRevenue - totalCosts;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = name === "productName" || name === "sourceLink" || name === "ebayLink" || name === "status" 
      ? value 
      : value === "" ? "" : parseFloat(value) || 0;

    const updatedData = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updatedData);
    
    // Recalculate profit when relevant fields change
    if (["sellPrice", "shippingCharges", "ebayCommission", "vat", "shippingCost", "unitPrice"].includes(name)) {
      const newProfit = calculateProfit(updatedData);
      setProfit(newProfit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/planner/ebay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          unitPrice: typeof formData.unitPrice === 'string' ? parseFloat(formData.unitPrice) || 0 : formData.unitPrice,
          sellPrice: typeof formData.sellPrice === 'string' ? parseFloat(formData.sellPrice) || 0 : formData.sellPrice,
          vat: typeof formData.vat === 'string' ? parseFloat(formData.vat) || 0 : formData.vat,
          shippingCharges: typeof formData.shippingCharges === 'string' ? parseFloat(formData.shippingCharges) || 0 : formData.shippingCharges,
          shippingCost: typeof formData.shippingCost === 'string' ? parseFloat(formData.shippingCost) || 0 : formData.shippingCost,
          profit: profit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }

      router.push('/planner/ebay');
    } catch (error) {
      console.error('Error creating plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to create plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add eBay Plan</h1>
          <p className="text-gray-600 mt-2">Create a new product plan for eBay selling</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <Input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price (Source Price) *
                </label>
                <Input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step={0.01}
                  min="0"
                />
              </div>

              {/* Sell Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sell Price *
                </label>
                <Input
                  type="number"
                  name="sellPrice"
                  value={formData.sellPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step={0.01}
                  min="0"
                />
              </div>

              {/* Source Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Link *
                </label>
                <Input
                  type="url"
                  name="sourceLink"
                  value={formData.sourceLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com/product"
                />
              </div>

              {/* eBay Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  eBay Link
                </label>
                <Input
                  type="url"
                  name="ebayLink"
                  value={formData.ebayLink}
                  onChange={handleInputChange}
                  placeholder="https://ebay.com/listing"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Costs & Fees</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* VAT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT (%)
                </label>
                <Input
                  type="number"
                  name="vat"
                  value={formData.vat}
                  onChange={handleInputChange}
                  placeholder="0"
                  step={0.01}
                  min="0"
                  max="100"
                />
              </div>

              {/* eBay Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  eBay Commission (%)
                </label>
                <Input
                  type="number"
                  name="ebayCommission"
                  value={formData.ebayCommission}
                  onChange={handleInputChange}
                  placeholder="15"
                  step={0.01}
                  min="0"
                  max="100"
                />
              </div>

              {/* Shipping Charges (from buyer) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Charges (from buyer) (€)
                </label>
                <Input
                  type="number"
                  name="shippingCharges"
                  value={formData.shippingCharges}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step={0.01}
                  min="0"
                />
              </div>

              {/* Shipping Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Cost (€)
                </label>
                <Input
                  type="number"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step={0.01}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Profit</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800"
                >
                  <option value="planned">Planned</option>
                  <option value="archived">Archived</option>
                  <option value="activated">Activated</option>
                </select>
              </div>

              {/* Profit Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculated Profit
                </label>
                <div className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm font-medium ${
                  profit >= 0 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  €{profit.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formula: (Sell Price + Shipping Charges) - (eBay Commission% + VAT% + Shipping Cost + Source Price)
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Plan..." : "Create Plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
