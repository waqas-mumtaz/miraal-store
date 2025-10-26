"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';

interface PackagingFormData {
  name: string;
  type: 'BOX' | 'ENVELOPE' | 'BAG' | 'TUBE' | 'OTHER';
  dimensions: {
    length: number | string;
    width: number | string;
    height: number | string;
  };
  weight: number | string;
  cost: number | string;
  stock: number | string;
  reorderPoint: number | string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  description: string;
}

export default function EditPackagingPage() {
  const router = useRouter();
  const params = useParams();
  const packagingId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PackagingFormData>({
    name: '',
    type: 'BOX',
    dimensions: {
      length: '' as any,
      width: '' as any,
      height: '' as any
    },
    weight: '' as any,
    cost: '' as any,
    stock: '' as any,
    reorderPoint: '' as any,
    status: 'ACTIVE',
    description: ''
  });

  // Fetch packaging item data
  useEffect(() => {
    const fetchPackagingItem = async () => {
      try {
        const response = await fetch(`/api/packaging/${packagingId}`);
        if (response.ok) {
          const data = await response.json();
          const item = data.data;
          
          setFormData({
            name: item.name || '',
            type: item.type || 'BOX',
            dimensions: {
              length: item.dimensions?.length || '' as any,
              width: item.dimensions?.width || '' as any,
              height: item.dimensions?.height || '' as any
            },
            weight: item.weight || '' as any,
            cost: item.cost || '' as any,
            stock: item.stock || '' as any,
            reorderPoint: item.reorderPoint || '' as any,
            status: item.status || 'ACTIVE',
            description: item.description || ''
          });
        } else {
          console.error('Failed to fetch packaging item');
          router.push('/inventory/packaging');
        }
      } catch (error) {
        console.error('Error fetching packaging item:', error);
        router.push('/inventory/packaging');
      } finally {
        setIsLoading(false);
      }
    };

    if (packagingId) {
      fetchPackagingItem();
    }
  }, [packagingId, router]);

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
        [name]: name === 'weight' || name === 'cost' || name === 'stock' || name === 'reorderPoint'
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

    const cost = typeof formData.cost === 'string' ? parseFloat(formData.cost) : formData.cost;
    const weight = typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight;
    const stock = typeof formData.stock === 'string' ? parseFloat(formData.stock) : formData.stock;
    const reorderPoint = typeof formData.reorderPoint === 'string' ? parseFloat(formData.reorderPoint) : formData.reorderPoint;

    if (isNaN(cost) || cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    if (isNaN(weight) || weight < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }

    if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (isNaN(reorderPoint) || reorderPoint < 0) {
      newErrors.reorderPoint = 'Reorder point cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/packaging/${packagingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          dimensions: {
            length: typeof formData.dimensions.length === 'string' ? parseFloat(formData.dimensions.length) : formData.dimensions.length,
            width: typeof formData.dimensions.width === 'string' ? parseFloat(formData.dimensions.width) : formData.dimensions.width,
            height: typeof formData.dimensions.height === 'string' ? parseFloat(formData.dimensions.height) : formData.dimensions.height,
          },
          weight: typeof formData.weight === 'string' ? parseFloat(formData.weight) : formData.weight,
          cost: typeof formData.cost === 'string' ? parseFloat(formData.cost) : formData.cost,
          stock: typeof formData.stock === 'string' ? parseFloat(formData.stock) : formData.stock,
          reorderPoint: typeof formData.reorderPoint === 'string' ? parseFloat(formData.reorderPoint) : formData.reorderPoint,
          status: formData.status,
          description: formData.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Packaging item updated:', data);
        router.push('/inventory/packaging');
      } else {
        const errorData = await response.json();
        console.error('Error updating packaging item:', errorData);
        alert(`Error: ${errorData.error || 'Failed to update packaging item'}`);
      }
    } catch (error) {
      console.error('Error saving packaging item:', error);
      alert('Error saving packaging item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this packaging item? This action cannot be undone.')) {
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/packaging/${packagingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Packaging item deleted');
        router.push('/inventory/packaging');
      } else {
        const errorData = await response.json();
        console.error('Error deleting packaging item:', errorData);
        alert(`Error: ${errorData.error || 'Failed to delete packaging item'}`);
      }
    } catch (error) {
      console.error('Error deleting packaging item:', error);
      alert('Error deleting packaging item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading packaging item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Packaging Item</h1>
          <p className="text-gray-600 mt-2">Update packaging item details</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/inventory/packaging')}
          >
            Back to Packaging
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isSaving}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            {isSaving ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
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
                  placeholder="Enter packaging name"
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
                  <option value="BOX">Box</option>
                  <option value="ENVELOPE">Envelope</option>
                  <option value="BAG">Bag</option>
                  <option value="TUBE">Tube</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dimensions (inches)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length
                </label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
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
                  value={formData.dimensions.width}
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
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Cost & Inventory */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cost & Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs) *
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
                  Stock *
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
                  placeholder="25"
                />
                {errors.reorderPoint && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorderPoint}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status & Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Status & Description
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inventory/packaging')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Packaging Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
