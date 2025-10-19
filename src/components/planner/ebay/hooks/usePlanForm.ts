import { useState } from "react";
import { PlanFormData, Marketplace, NUMERIC_FIELDS } from "../types";

export const usePlanForm = () => {
  const [marketplace, setMarketplace] = useState<Marketplace>("ebay");
  const [formData, setFormData] = useState<PlanFormData>({
    productName: "",
    unitPrice: "",
    sellPrice: "",
    sourceLink: "",
    ebayLink: "",
    vat: "",
    ebayCommission: 15,
    advertisingPercentage: "",
    fulfillmentCost: "",
    feePerItem: "",
    shippingCharges: "",
    shippingCost: "",
    status: "planned",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = ["productName", "sourceLink", "ebayLink", "status"].includes(name)
      ? value
      : value === ""
      ? ""
      : parseFloat(value) || 0;

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleMarketplaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMarketplace = e.target.value as Marketplace;
    setMarketplace(newMarketplace);
  };

  const isNumericField = (fieldName: string) => NUMERIC_FIELDS.includes(fieldName as any);

  return {
    marketplace,
    formData,
    setFormData,
    handleInputChange,
    handleMarketplaceChange,
    isNumericField,
  };
};
