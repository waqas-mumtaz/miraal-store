export interface PlanFormData {
  productName: string;
  unitPrice: string | number;
  sellPrice: string | number;
  sourceLink: string;
  ebayLink: string;
  vat: string | number;
  ebayCommission: number;
  advertisingPercentage: string | number;
  fulfillmentCost?: string | number;
  feePerItem?: string | number;
  shippingCharges: string | number;
  shippingCost: string | number;
  status: string;
  fulfillmentType: "FBA" | "FBM";
  storageFees: string | number;
}

export interface ProfitBreakdown {
  profit: number;
  netRevenue: number;
  totalRevenue: number;
  ebayCommissionAmount: number;
  advertisingAmount: number;
  totalCosts: number;
  marketplaceFee: number;
}

export type Marketplace = "ebay" | "amazon";

export const NUMERIC_FIELDS = [
  "sellPrice",
  "shippingCharges",
  "ebayCommission",
  "vat",
  "advertisingPercentage",
  "fulfillmentCost",
  "feePerItem",
  "storageFees",
  "shippingCost",
  "unitPrice",
] as const;
