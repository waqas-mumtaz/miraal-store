"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';

interface PurchaseOrderItem {
  id: string;
  packagingId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  notes: string;
  packagingItem: {
    id: string;
    name: string;
    cost: number;
  };
}

interface PurchaseOrderFormData {
  poNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
  supplier: string;
  notes: string;
  expectedDelivery: string;
  items: PurchaseOrderItem[];
}

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    poNumber: '',
    status: 'PENDING',
    supplier: '',
    notes: '',
    expectedDelivery: '',
    items: []
  });

  // Fetch purchase order data
  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const response = await fetch(`/api/purchase-orders/${poId}`);
        if (response.ok) {
          const data = await response.json();
          const po = data.data;
          
          setFormData({
            poNumber: po.poNumber || '',
            status: po.status || 'PENDING',
            supplier: po.supplier || '',
            notes: po.notes || '',
            expectedDelivery: po.expectedDelivery ? new Date(po.expectedDelivery).toISOString().split('T')[0] : '',
            items: po.items || []
          });
        } else {
          console.error('Failed to fetch purchase order');
          router.push('/inventory/purchase-orders');
        }
      } catch (error) {
        console.error('Error fetching purchase order:', error);
        router.push('/inventory/purchase-orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (poId) {
      fetchPurchaseOrder();
    }
  }, [poId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (itemId: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.poNumber.trim()) {
      newErrors.poNumber = 'PO Number is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
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
      const response = await fetch(`/api/purchase-orders/${poId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poNumber: formData.poNumber,
          status: formData.status,
          supplier: formData.supplier,
          notes: formData.notes,
          expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : null,
          items: formData.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.totalCost,
            supplier: item.supplier,
            notes: item.notes
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Purchase order updated:', data);
        router.push('/inventory/purchase-orders');
      } else {
        const errorData = await response.json();
        console.error('Error updating purchase order:', errorData);
        alert(`Error: ${errorData.error || 'Failed to update purchase order'}`);
      }
    } catch (error) {
      console.error('Error saving purchase order:', error);
      alert('Error saving purchase order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/purchase-orders/${poId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Purchase order deleted');
        router.push('/inventory/purchase-orders');
      } else {
        const errorData = await response.json();
        console.error('Error deleting purchase order:', errorData);
        alert(`Error: ${errorData.error || 'Failed to delete purchase order'}`);
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      alert('Error deleting purchase order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      RECEIVED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const calculateTotalCost = () => {
    return formData.items.reduce((total, item) => total + item.totalCost, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading purchase order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Purchase Order</h1>
          <p className="text-gray-600 mt-2">Update purchase order details</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/inventory/purchase-orders')}
          >
            Back to Purchase Orders
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
                  PO Number *
                </label>
                <input
                  type="text"
                  name="poNumber"
                  value={formData.poNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.poNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter PO number"
                />
                {errors.poNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.poNumber}</p>
                )}
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
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="RECEIVED">Received</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  name="expectedDelivery"
                  value={formData.expectedDelivery}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional notes..."
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            {errors.items && (
              <p className="text-sm text-red-600 mb-4">{errors.items}</p>
            )}
            
            {formData.items.length > 0 ? (
              <div className="space-y-4">
                {formData.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{item.packagingItem.name}</h3>
                      <div className="text-sm text-gray-500">
                        Total: €{item.totalCost.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit Cost (€)
                        </label>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => {
                            const unitCost = parseFloat(e.target.value) || 0;
                            const totalCost = unitCost * item.quantity;
                            handleItemChange(item.id, 'unitCost', unitCost);
                            handleItemChange(item.id, 'totalCost', totalCost);
                          }}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Supplier
                        </label>
                        <input
                          type="text"
                          value={item.supplier}
                          onChange={(e) => handleItemChange(item.id, 'supplier', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No items in this purchase order</p>
              </div>
            )}
          </div>

          {/* Total Cost */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
              <span className="text-xl font-bold text-gray-900">€{calculateTotalCost().toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inventory/purchase-orders')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Purchase Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
