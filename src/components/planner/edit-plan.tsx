"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/form/Form";
import { usePlanForm, useProfitCalculation } from "./hooks";
import { ProductInfoForm, CostsForm, StatusProfitForm, ErrorDisplay, MarketplaceSelector } from "./components";
import { NUMERIC_FIELDS } from "./types";

interface Plan {
  id: string;
  productName: string;
  ean?: string;
  unitPrice: number;
  sellPrice: number;
  sourceLink: string;
  soldItems: number;
  shippingCharges: number;
  shippingCost: number;
  status: string;
  profit: number;
  marketplace: string;
  ebayDetails?: {
    productLink?: string;
    vat: number;
    ebayCommission: number;
    advertisingPercentage: number;
  };
  amazonDetails?: {
    fulfillmentCost: number;
    feePerItem: number;
    storageFees: number;
    fulfillmentType: string;
  };
}

interface EditPlanProps {
  planId: string;
}

export default function EditPlan({ planId }: EditPlanProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    marketplace,
    formData,
    handleInputChange,
    handleMarketplaceChange,
    isNumericField,
    setFormData,
    setMarketplace,
  } = usePlanForm();

  const { profitBreakdown, updateProfit } = useProfitCalculation();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/planner/ebay/${planId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch plan");
        }

        const data = await response.json();
        const plan: Plan = data.plan;

        // Populate form data
        setFormData({
          productName: plan.productName,
          ean: plan.ean || "",
          unitPrice: Number(plan.unitPrice).toString(),
          sellPrice: Number(plan.sellPrice).toString(),
          sourceLink: plan.sourceLink,
          productLink: plan.ebayDetails?.productLink || "",
          soldItems: plan.soldItems ? Number(plan.soldItems).toString() : "0",
          vat: plan.ebayDetails?.vat ? Number(plan.ebayDetails.vat).toString() : "0",
          ebayCommission: plan.ebayDetails?.ebayCommission ? Number(plan.ebayDetails.ebayCommission).toString() : "15",
          advertisingPercentage: plan.ebayDetails?.advertisingPercentage ? Number(plan.ebayDetails.advertisingPercentage).toString() : "0",
          fulfillmentCost: plan.amazonDetails?.fulfillmentCost ? Number(plan.amazonDetails.fulfillmentCost).toString() : "0",
          feePerItem: plan.amazonDetails?.feePerItem ? Number(plan.amazonDetails.feePerItem).toString() : "0",
          storageFees: plan.amazonDetails?.storageFees ? Number(plan.amazonDetails.storageFees).toString() : "0",
          shippingCharges: Number(plan.shippingCharges).toString(),
          shippingCost: Number(plan.shippingCost).toString(),
          status: plan.status,
          fulfillmentType: (plan.amazonDetails?.fulfillmentType as "FBA" | "FBM") || "FBA",
        });

        setMarketplace(plan.marketplace as "ebay" | "amazon");
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("Failed to load plan data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, setFormData, setMarketplace]);

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
      const response = await fetch(`/api/planner/ebay/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, marketplace, profit: profitBreakdown.profit }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update plan");
      }

      router.push("/planner");
    } catch (error) {
      console.error("Error updating plan:", error);
      setError(error instanceof Error ? error.message : "Failed to update plan");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product Plan</h1>
        <p className="text-gray-600">Update your product plan details</p>
      </div>

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
