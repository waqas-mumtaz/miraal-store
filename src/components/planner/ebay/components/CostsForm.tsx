import Input from "@/components/form/input/InputField";
import { PlanFormData, ProfitBreakdown, Marketplace } from "../types";

interface CostsFormProps {
  formData: PlanFormData;
  profitBreakdown: ProfitBreakdown;
  marketplace: Marketplace;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const CostsForm = ({ formData, profitBreakdown, marketplace, onChange }: CostsFormProps) => {
  const { netRevenue, ebayCommissionAmount, advertisingAmount, marketplaceFee } = profitBreakdown;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Costs & Fees</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VAT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">VAT (%)</label>
          <Input 
            type="number" 
            name="vat" 
            value={formData.vat} 
            onChange={onChange} 
            placeholder="0" 
            step={0.01} 
            min="0" 
            max="100" 
          />
          <p className="text-xs text-gray-500 mt-1">Net Revenue: €{netRevenue.toFixed(2)}</p>
        </div>

        {/* eBay Commission - only show for eBay */}
        {marketplace === "ebay" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">eBay Commission (%)</label>
            <Input 
              type="number" 
              name="ebayCommission" 
              value={formData.ebayCommission} 
              onChange={onChange} 
              placeholder="15" 
              step={0.01} 
              min="0" 
              max="100" 
            />
            <p className="text-xs text-gray-500 mt-1">€{ebayCommissionAmount.toFixed(2)}</p>
          </div>
        )}

        {/* Advertising - only show for eBay */}
        {marketplace === "ebay" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advertising (%)</label>
            <Input 
              type="number" 
              name="advertisingPercentage" 
              value={formData.advertisingPercentage} 
              onChange={onChange} 
              placeholder="0" 
              step={0.01} 
              min="0" 
              max="100" 
            />
            <p className="text-xs text-gray-500 mt-1">€{advertisingAmount.toFixed(2)} (VAT included)</p>
          </div>
        )}

        {/* Amazon Fulfillment - only show for Amazon */}
        {marketplace === "amazon" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment Cost (€)</label>
            <Input 
              type="number" 
              name="fulfillmentCost" 
              value={formData.fulfillmentCost || ""} 
              onChange={onChange} 
              placeholder="0.00" 
              step={0.01} 
              min="0" 
            />
            <p className="text-xs text-gray-500 mt-1">Amazon fulfillment and storage fees</p>
          </div>
        )}

        {/* Amazon Fee per Item - only show for Amazon */}
        {marketplace === "amazon" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee per Item Sold (€)</label>
            <Input 
              type="number" 
              name="feePerItem" 
              value={formData.feePerItem || ""} 
              onChange={onChange} 
              placeholder="0.00" 
              step={0.01} 
              min="0" 
            />
            <p className="text-xs text-gray-500 mt-1">Amazon fees per individual item sold</p>
          </div>
        )}


        {/* Shipping Charges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Charges (from buyer) (€)</label>
          <Input 
            type="number" 
            name="shippingCharges" 
            value={formData.shippingCharges} 
            onChange={onChange} 
            placeholder="0.00" 
            step={0.01} 
            min="0" 
          />
        </div>

        {/* Shipping Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost (€)</label>
          <Input 
            type="number" 
            name="shippingCost" 
            value={formData.shippingCost} 
            onChange={onChange} 
            placeholder="0.00" 
            step={0.01} 
            min="0" 
          />
        </div>
      </div>
    </div>
  );
};
