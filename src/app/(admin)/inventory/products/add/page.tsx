"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

interface ProductFormData {
  name: string;
  sku: string;
  category: 'Perfume' | 'Skin Care' | 'Makeup';
  price: number | string;
  cost: number | string;
  stock: number | string;
  reorderPoint: number | string;
  status: 'active' | 'inactive';
  description: string;
  brand?: string;
  weight?: number | string;
  dimensions?: {
    length: number | string;
    width: number | string;
    height: number | string;
  };
  supplier?: string;
  barcode?: string;
  // Packaging integration
  packagingId?: string;
  packagingQuantity: number | string;
  usePackagingCost: boolean;
}

interface PackagingItem {
  id: string;
  name: string;
  cost: number;
  stock: number;
  status: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingItem | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    category: 'Perfume',
    price: '' as any,
    cost: '' as any,
    stock: '' as any,
    reorderPoint: '' as any,
    status: 'active',
    description: '',
    brand: '',
    weight: '' as any,
    dimensions: {
      length: '' as any,
      width: '' as any,
      height: '' as any
    },
    supplier: '',
    barcode: '',
    // Packaging integration
    packagingId: '',
    packagingQuantity: 1,
    usePackagingCost: false
  });

  // Fetch packaging items on component mount
  useEffect(() => {
    const fetchPackagingItems = async () => {
      try {
        const response = await fetch('/api/packaging');
        if (response.ok) {
          const data = await response.json();
          setPackagingItems(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching packaging items:', error);
      }
    };

    fetchPackagingItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionField = name.split('.')[1] as keyof typeof formData.dimensions;
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: value === '' ? '' : parseFloat(value) || 0
        }
      }));
    } else if (name === 'packagingId') {
      const packaging = packagingItems.find(p => p.id === value);
      setSelectedPackaging(packaging || null);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        usePackagingCost: !!value
      }));
    } else if (name === 'usePackagingCost') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'cost' || name === 'stock' || name === 'reorderPoint' || name === 'weight' || name === 'packagingQuantity'
          ? (value === '' ? '' : parseFloat(value) || 0)
          : value
      }));
    }
  };

  // Calculate total cost including packaging
  const calculateTotalCost = () => {
    const baseCost = typeof formData.cost === 'string' ? parseFloat(formData.cost) || 0 : formData.cost;
    const packagingQuantity = typeof formData.packagingQuantity === 'string' ? parseFloat(formData.packagingQuantity) || 1 : formData.packagingQuantity;
    
    if (formData.usePackagingCost && selectedPackaging) {
      return baseCost + (selectedPackaging.cost * packagingQuantity);
    }
    return baseCost;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    const cost = typeof formData.cost === 'string' ? parseFloat(formData.cost) : formData.cost;
    const stock = typeof formData.stock === 'string' ? parseFloat(formData.stock) : formData.stock;
    const reorderPoint = typeof formData.reorderPoint === 'string' ? parseFloat(formData.reorderPoint) : formData.reorderPoint;
    const weight = typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight;

    if (isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (isNaN(cost) || cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (isNaN(reorderPoint) || reorderPoint < 0) {
      newErrors.reorderPoint = 'Reorder point cannot be negative';
    }

    if (weight && (isNaN(weight) || weight < 0)) {
      newErrors.weight = 'Weight cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
          cost: calculateTotalCost(), // Use calculated total cost
          stock: typeof formData.stock === 'string' ? parseFloat(formData.stock) : formData.stock,
          reorderPoint: typeof formData.reorderPoint === 'string' ? parseFloat(formData.reorderPoint) : formData.reorderPoint,
          status: formData.status.toUpperCase(),
          description: formData.description,
          brand: formData.brand,
          weight: formData.weight ? (typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight) : null,
          dimensions: {
            length: typeof formData.dimensions?.length === 'string' ? parseFloat(formData.dimensions.length) : formData.dimensions?.length,
            width: typeof formData.dimensions?.width === 'string' ? parseFloat(formData.dimensions.width) : formData.dimensions?.width,
            height: typeof formData.dimensions?.height === 'string' ? parseFloat(formData.dimensions.height) : formData.dimensions?.height,
          },
          supplier: formData.supplier,
          barcode: formData.barcode,
          // Packaging integration
          packagingId: formData.packagingId || null,
          packagingQuantity: typeof formData.packagingQuantity === 'string' ? parseFloat(formData.packagingQuantity) : formData.packagingQuantity,
          usePackagingCost: formData.usePackagingCost
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Product created:', data);
        
        // Redirect back to products list
        router.push('/inventory/products');
      } else {
        const errorData = await response.json();
        console.error('Error creating product:', errorData);
        alert(`Error: ${errorData.error || 'Failed to create product'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
          <p className="text-gray-600 mt-2">Add a new product to your inventory</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/inventory/products')}
        >
          Back to Products
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.sku ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter SKU"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Perfume">Perfume</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Makeup">Makeup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price (€) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost (€) *
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cost ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reorder Point *
                </label>
                <input
                  type="number"
                  name="reorderPoint"
                  value={formData.reorderPoint}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.reorderPoint ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.reorderPoint && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorderPoint}</p>
                )}
              </div>
            </div>
          </div>

          {/* Packaging Integration */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Packaging Integration (Optional)
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Smart Cost Calculation
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Link packaging to automatically calculate total product cost. When packaging costs change, your product costs will update automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Packaging
                </label>
                <select
                  name="packagingId"
                  value={formData.packagingId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No packaging selected</option>
                  {packagingItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - €{item.cost.toFixed(2)} (Stock: {item.stock})
                    </option>
                  ))}
                </select>
                {packagingItems.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    No packaging items available. <a href="/inventory/packaging/add" className="text-blue-600 hover:text-blue-800">Add packaging items first</a>.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Packaging Quantity
                </label>
                <input
                  type="number"
                  name="packagingQuantity"
                  value={formData.packagingQuantity}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  disabled={!formData.packagingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  How many packaging units per product
                </p>
              </div>
            </div>

            {selectedPackaging && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">Cost Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Base Product Cost:</span>
                    <span className="text-green-800 font-medium">€{typeof formData.cost === 'string' ? parseFloat(formData.cost) || 0 : formData.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Packaging Cost ({selectedPackaging.name}):</span>
                    <span className="text-green-800 font-medium">€{(selectedPackaging.cost * (typeof formData.packagingQuantity === 'string' ? parseFloat(formData.packagingQuantity) || 1 : formData.packagingQuantity)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-1">
                    <span className="text-green-800 font-semibold">Total Cost:</span>
                    <span className="text-green-900 font-bold">€{calculateTotalCost().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="usePackagingCost"
                  checked={formData.usePackagingCost}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Use packaging cost in total product cost calculation
                </span>
              </label>
            </div>
          </div>

          {/* Physical Properties */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Physical Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.weight ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Dimensions (inches)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.dimensions?.length}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.dimensions?.width}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.dimensions?.height}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inventory/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Product...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
