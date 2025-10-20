import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
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
          <Label>Product Name *</Label>
          <Input 
            type="text" 
            name="productName" 
            value={formData.productName} 
            onChange={onChange} 
            placeholder="Enter product name" 
          />
        </div>
        <div>
          <Label>Unit Price *</Label>
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
          <Label>Sell Price *</Label>
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
          <Label>Source Link *</Label>
          <Input 
            type="url" 
            name="sourceLink" 
            value={formData.sourceLink} 
            onChange={onChange} 
            placeholder="https://example.com/product" 
          />
        </div>
        <div>
          <Label>eBay Link</Label>
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
