import Button from "@/components/ui/button/Button";
import { PlanFormData, ProfitBreakdown } from "../types";

interface StatusProfitFormProps {
  formData: PlanFormData;
  profitBreakdown: ProfitBreakdown;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const StatusProfitForm = ({ 
  formData, 
  profitBreakdown, 
  isLoading, 
  onChange, 
  onSubmit, 
  onCancel 
}: StatusProfitFormProps) => {
  const { profit } = profitBreakdown;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Profit</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300"
          >
            <option value="planned">Planned</option>
            <option value="archived">Archived</option>
            <option value="activated">Activated</option>
          </select>
        </div>

        {/* Profit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Calculated Profit</label>
          <div className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm font-medium ${
            profit >= 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            €{profit.toFixed(2)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Formula: Net Revenue - (eBay Commission + Advertising + Shipping Cost + Source Price)
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Plan..." : "Create Plan"}
        </Button>
      </div>
    </div>
  );
};
