"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

interface PackagingFormData {
  name: string;
  type: 'box' | 'envelope' | 'bag' | 'tube' | 'other';
  dimensions: {
    length: number | string;
    width: number | string;
    height: number | string;
  };
  weight: number | string;
  cost: number | string;
  stock: number | string;
  status: 'active' | 'inactive';
  description: string;
}

export default function AddPackagingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PackagingFormData>({
    name: '',
    type: 'box',
    dimensions: {
      length: '' as any,
      width: '' as any,
      height: '' as any
    },
    weight: '' as any,
    cost: '' as any,
    stock: '' as any,
    status: 'active',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionField = name.split('.')[1] as keyof typeof formData.dimensions;
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: value === '' ? '' : parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'weight' || name === 'cost' || name === 'stock' 
          ? (value === '' ? '' : parseFloat(value) || 0)
          : value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const length = typeof formData.dimensions.length === 'string' ? parseFloat(formData.dimensions.length) : formData.dimensions.length;
    const width = typeof formData.dimensions.width === 'string' ? parseFloat(formData.dimensions.width) : formData.dimensions.width;
    const height = typeof formData.dimensions.height === 'string' ? parseFloat(formData.dimensions.height) : formData.dimensions.height;
    const weight = typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight;
    const cost = typeof formData.cost === 'string' ? parseFloat(formData.cost) : formData.cost;
    const stock = typeof formData.stock === 'string' ? parseFloat(formData.stock) : formData.stock;

    if (isNaN(length) || length <= 0) {
      newErrors['dimensions.length'] = 'Length must be greater than 0';
    }

    if (isNaN(width) || width <= 0) {
      newErrors['dimensions.width'] = 'Width must be greater than 0';
    }

    if (isNaN(height) || height < 0) {
      newErrors['dimensions.height'] = 'Height cannot be negative';
    }

    if (isNaN(weight) || weight < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }

    if (isNaN(cost) || cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
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
      const response = await fetch('/api/packaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type.toUpperCase(),
          dimensions: {
            length: typeof formData.dimensions.length === 'string' ? parseFloat(formData.dimensions.length) : formData.dimensions.length,
            width: typeof formData.dimensions.width === 'string' ? parseFloat(formData.dimensions.width) : formData.dimensions.width,
            height: typeof formData.dimensions.height === 'string' ? parseFloat(formData.dimensions.height) : formData.dimensions.height,
          },
          weight: typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight,
          cost: typeof formData.cost === 'string' ? parseFloat(formData.cost) : formData.cost,
          stock: typeof formData.stock === 'string' ? parseFloat(formData.stock) : formData.stock,
          status: formData.status.toUpperCase(),
          description: formData.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Packaging item created:', data);
        
        // Redirect back to packaging list
        router.push('/inventory/packaging');
      } else {
        const errorData = await response.json();
        console.error('Error creating packaging item:', errorData);
        alert(`Error: ${errorData.error || 'Failed to create packaging item'}`);
      }
    } catch (error) {
      console.error('Error saving packaging item:', error);
      alert('Error saving packaging item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/inventory/packaging');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Packaging Item</h1>
          <p className="text-gray-600 mt-2">Create a new packaging material for your inventory</p>
        </div>
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Small Shipping Box"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="box">Box</option>
                  <option value="envelope">Envelope</option>
                  <option value="bag">Bag</option>
                  <option value="tube">Tube</option>
                  <option value="other">Other</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Stock
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
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length (inches) *
                </label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['dimensions.length'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors['dimensions.length'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['dimensions.length']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (inches) *
                </label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['dimensions.width'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors['dimensions.width'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['dimensions.width']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (inches)
                </label>
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['dimensions.height'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors['dimensions.height'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['dimensions.height']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Weight and Cost */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weight and Cost</h2>
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
                  Cost per Unit (€)
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
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description or notes about this packaging item..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Packaging Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
