import Input from "@/components/form/input/InputField";
import { PlanFormData } from "../types";

interface ProductInfoFormProps {
  formData: PlanFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ProductInfoForm = ({ formData, onChange }: ProductInfoFormProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
          <Input 
            type="text" 
            name="productName" 
            value={formData.productName} 
            onChange={onChange} 
            placeholder="Enter product name" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
          <Input 
            type="number" 
            name="unitPrice" 
            value={formData.unitPrice} 
            onChange={onChange} 
            placeholder="0.00" 
            step={0.01} 
            min="0" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price *</label>
          <Input 
            type="number" 
            name="sellPrice" 
            value={formData.sellPrice} 
            onChange={onChange} 
            placeholder="0.00" 
            step={0.01} 
            min="0" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source Link *</label>
          <Input 
            type="url" 
            name="sourceLink" 
            value={formData.sourceLink} 
            onChange={onChange} 
            placeholder="https://example.com/product" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">eBay Link</label>
          <Input 
            type="url" 
            name="ebayLink" 
            value={formData.ebayLink} 
            onChange={onChange} 
            placeholder="https://ebay.com/listing" 
          />
        </div>
      </div>
    </div>
  );
};
