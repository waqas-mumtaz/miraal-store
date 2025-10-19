import { useState, useCallback } from "react";
import { PlanFormData, ProfitBreakdown, Marketplace } from "../types";

export const useProfitCalculation = () => {
  const [profitBreakdown, setProfitBreakdown] = useState<ProfitBreakdown>({
    profit: 0,
    netRevenue: 0,
    totalRevenue: 0,
    ebayCommissionAmount: 0,
    advertisingAmount: 0,
    totalCosts: 0,
    marketplaceFee: 0,
  });

  const toNumber = (value: string | number) => 
    typeof value === "string" ? parseFloat(value) || 0 : value || 0;

  const calculateProfit = useCallback((data: PlanFormData, marketplace: Marketplace): ProfitBreakdown => {
    const sellPrice = toNumber(data.sellPrice);
    const shippingCharges = toNumber(data.shippingCharges);
    const vat = toNumber(data.vat);
    const shippingCost = toNumber(data.shippingCost);
    const unitPrice = toNumber(data.unitPrice);

    const totalRevenue = sellPrice + shippingCharges;
    const netRevenue = totalRevenue / (1 + vat / 100);

    let marketplaceFee = 0;
    let ebayCommissionAmount = 0;
    let advertisingAmount = 0;

    if (marketplace === "ebay") {
      const ebayCommission = toNumber(data.ebayCommission);
      const advertisingPercentage = toNumber(data.advertisingPercentage);
      ebayCommissionAmount = (totalRevenue * ebayCommission) / 100;
      advertisingAmount = (sellPrice * advertisingPercentage / 100) * (1 + vat / 100);
      marketplaceFee = ebayCommissionAmount + advertisingAmount;
    } else if (marketplace === "amazon") {
      const fulfillmentCost = 0; // Add fulfillmentCost to PlanFormData if needed
      const fixedAmazonFeePercentage = 15; // fixed Amazon fee %
      marketplaceFee = (totalRevenue * fixedAmazonFeePercentage) / 100 + fulfillmentCost;
    }

    const totalCosts = marketplaceFee + shippingCost + unitPrice;
    const profit = netRevenue - totalCosts;

    return { profit, netRevenue, totalRevenue, ebayCommissionAmount, advertisingAmount, totalCosts, marketplaceFee };
  }, []);

  const updateProfit = useCallback((data: PlanFormData, marketplace: Marketplace) => {
    const newBreakdown = calculateProfit(data, marketplace);
    setProfitBreakdown(newBreakdown);
  }, [calculateProfit]);

  return {
    profitBreakdown,
    calculateProfit,
    updateProfit,
  };
};
