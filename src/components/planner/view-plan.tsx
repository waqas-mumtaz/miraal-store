"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { PlanFormData, Marketplace } from "./types"; // Not used in current implementation

interface Plan {
  id: string;
  productName: string;
  unitPrice: number;
  sellPrice: number;
  sourceLink: string;
  shippingCharges: number;
  shippingCost: number;
  status: string;
  profit: number;
  marketplace: string;
  ebayDetails?: {
    ebayLink?: string;
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
  createdAt: string;
  updatedAt: string;
}

interface ViewPlanProps {
  planId: string;
}

export default function ViewPlan({ planId }: ViewPlanProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
        setPlan(data.plan);
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("Failed to load plan data");
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  if (isLoading) {
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

  if (error || !plan) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || "Plan not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isEbay = plan.marketplace === "ebay";
  const isAmazon = plan.marketplace === "amazon";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{plan.productName}</h1>
        <p className="text-gray-600 mt-2">
          {isEbay ? "eBay" : "Amazon"} Plan • {plan.status}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <p className="text-gray-900">{plan.productName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Price</label>
              <p className="text-gray-900">€{Number(plan.unitPrice).toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sell Price</label>
              <p className="text-gray-900">€{Number(plan.sellPrice).toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source Link</label>
              <a
                href={plan.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Source
              </a>
            </div>
            {isEbay && plan.ebayDetails?.ebayLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700">eBay Link</label>
                <a
                  href={plan.ebayDetails.ebayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View on eBay
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Costs & Fees */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Costs & Fees</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipping Charges</label>
              <p className="text-gray-900">€{Number(plan.shippingCharges).toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shipping Cost</label>
              <p className="text-gray-900">€{Number(plan.shippingCost).toFixed(2)}</p>
            </div>
            
            {isEbay && plan.ebayDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">VAT (%)</label>
                  <p className="text-gray-900">{Number(plan.ebayDetails.vat).toFixed(2)}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">eBay Commission (%)</label>
                  <p className="text-gray-900">{Number(plan.ebayDetails.ebayCommission).toFixed(2)}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Advertising (%)</label>
                  <p className="text-gray-900">{Number(plan.ebayDetails.advertisingPercentage).toFixed(2)}%</p>
                </div>
              </>
            )}

            {isAmazon && plan.amazonDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fulfillment Cost</label>
                  <p className="text-gray-900">€{Number(plan.amazonDetails.fulfillmentCost).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fee per Item</label>
                  <p className="text-gray-900">€{Number(plan.amazonDetails.feePerItem).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Storage Fees</label>
                  <p className="text-gray-900">€{Number(plan.amazonDetails.storageFees).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fulfillment Type</label>
                  <p className="text-gray-900">{plan.amazonDetails.fulfillmentType}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profit Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profit Analysis</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Total Revenue:</span>
              <span className="text-gray-900">€{(Number(plan.sellPrice) + Number(plan.shippingCharges)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Total Costs:</span>
              <span className="text-gray-900">€{(Number(plan.unitPrice) + Number(plan.shippingCost)).toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Profit:</span>
                <span className={`text-lg font-semibold ${Number(plan.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{Number(plan.profit).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Actions</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                plan.status === 'activated' ? 'bg-green-100 text-green-800' :
                plan.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="text-gray-900">{new Date(plan.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <p className="text-gray-900">{new Date(plan.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="pt-4 space-x-3">
              <button
                onClick={() => router.push(`/planner/edit/${planId}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Plan
              </button>
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
