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
          <label className="block text-sm font-medium text-gray-700 mb-2">Marketplace *</label>
          <select
            name="marketplace"
            value={marketplace}
            onChange={onChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300"
          >
            <option value="ebay">eBay</option>
            <option value="amazon">Amazon</option>
          </select>
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
