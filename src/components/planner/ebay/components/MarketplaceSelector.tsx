import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { Marketplace } from "../types";

interface MarketplaceSelectorProps {
  marketplace: Marketplace;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const MarketplaceSelector = ({ marketplace, onChange }: MarketplaceSelectorProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Selection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Marketplace *</Label>
          <Select
            options={[
              { value: "ebay", label: "eBay" },
              { value: "amazon", label: "Amazon" }
            ]}
            placeholder="Select marketplace"
            onChange={(value) => onChange({ target: { name: "marketplace", value } } as any)}
            defaultValue={marketplace}
          />
        </div>
        <div className="flex items-end">
          <div className="text-sm text-gray-500">
            {marketplace === "ebay" 
              ? "eBay: Commission + Advertising fees" 
              : "Amazon: Fixed 15% + Fulfillment fees"
            }
          </div>
        </div>
      </div>
    </div>
  );
};
