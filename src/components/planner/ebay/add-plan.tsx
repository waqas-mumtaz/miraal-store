"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanForm, useProfitCalculation } from "./hooks";
import { ProductInfoForm, CostsForm, StatusProfitForm, ErrorDisplay } from "./components";
import { NUMERIC_FIELDS } from "./types";

export default function AddPlan() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    marketplace,
    formData,
    handleInputChange,
    handleMarketplaceChange,
    isNumericField,
  } = usePlanForm();

  const { profitBreakdown, updateProfit } = useProfitCalculation();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleInputChange(e);
    
    if (isNumericField(e.target.name)) {
      updateProfit({ ...formData, [e.target.name]: e.target.value }, marketplace);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, marketplace, profit: profitBreakdown.profit }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create plan");
      }

      router.push("/planner");
    } catch (error) {
      console.error("Error creating plan:", error);
      setError(error instanceof Error ? error.message : "Failed to create plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Product Plan</h1>
      <p className="text-gray-600 mb-6">Create a new product plan for your marketplace</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ProductInfoForm formData={formData} onChange={handleFormChange} />
        <CostsForm 
          formData={formData} 
          profitBreakdown={profitBreakdown} 
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
      </form>
    </div>
  );
}