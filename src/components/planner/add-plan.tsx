"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Form from "@/components/form/Form";
import { usePlanForm, useProfitCalculation } from "./hooks";
import { ProductInfoForm, CostsForm, StatusProfitForm, ErrorDisplay, MarketplaceSelector } from "./components";

export default function AddPlan() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    marketplace,
    formData,
    handleInputChange,
    handleMarketplaceChange,
    setMarketplace,
    isNumericField,
  } = usePlanForm();

  // Set marketplace based on URL
  useEffect(() => {
    if (pathname.includes('/ebay/')) {
      setMarketplace('ebay');
    } else if (pathname.includes('/amazon/')) {
      setMarketplace('amazon');
    }
  }, [pathname, setMarketplace]);

  const { profitBreakdown, updateProfit } = useProfitCalculation();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleInputChange(e);
    
    if (isNumericField(e.target.name)) {
      updateProfit({ ...formData, [e.target.name]: e.target.value }, marketplace);
    }
  };

  const handleMarketplaceFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleMarketplaceChange(e);
    // Recalculate profit when marketplace changes
    updateProfit(formData, e.target.value as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/planner/ebay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, marketplace, profit: profitBreakdown.profit }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create plan");
      }

      // Redirect to the appropriate marketplace page
      if (marketplace === 'ebay') {
        router.push("/planner/ebay");
      } else if (marketplace === 'amazon') {
        router.push("/planner/amazon");
      } else {
        router.push("/planner");
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      setError(error instanceof Error ? error.message : "Failed to create plan");
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    if (marketplace === 'ebay') return 'Add eBay Plan';
    if (marketplace === 'amazon') return 'Add Amazon Plan';
    return 'Add Product Plan';
  };

  const getPageDescription = () => {
    if (marketplace === 'ebay') return 'Create a new eBay product plan with commission and advertising calculations';
    if (marketplace === 'amazon') return 'Create a new Amazon product plan with fulfillment and storage calculations';
    return 'Create a new product plan for your marketplace';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
      <p className="text-gray-600 mb-6">{getPageDescription()}</p>

      <Form onSubmit={handleSubmit} className="space-y-6">
        <MarketplaceSelector 
          marketplace={marketplace} 
          onChange={handleMarketplaceFormChange} 
        />
        <ProductInfoForm formData={formData} onChange={handleFormChange} />
        <CostsForm 
          formData={formData} 
          profitBreakdown={profitBreakdown} 
          marketplace={marketplace}
          onChange={handleFormChange} 
        />
        <StatusProfitForm
          formData={formData}
          profitBreakdown={profitBreakdown}
          isLoading={isLoading}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
        <ErrorDisplay error={error} />
      </Form>
    </div>
  );
}