"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

interface PackagingItem {
  id: string;
  name: string;
  type: string;
  currentStock: number;
  cost: number;
  status: string;
}

interface ReplenishmentItem {
  packagingId: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  notes: string;
}

export default function ReplenishPackagingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ReplenishmentItem[]>([]);

  // Sample packaging items (in real app, this would come from API)
  const [packagingItems] = useState<PackagingItem[]>([
    {
      id: '1',
      name: 'Small Shipping Box',
      type: 'box',
      currentStock: 5,
      cost: 0.45,
      status: 'active'
    },
    {
      id: '2',
      name: 'Medium Shipping Box',
      type: 'box',
      currentStock: 0,
      cost: 0.65,
      status: 'active'
    },
    {
      id: '3',
      name: 'Large Shipping Box',
      type: 'box',
      currentStock: 0,
      cost: 0.95,
      status: 'active'
    },
    {
      id: '4',
      name: 'Bubble Mailer Envelope',
      type: 'envelope',
      currentStock: 15,
      cost: 0.25,
      status: 'active'
    },
    {
      id: '5',
      name: 'Protective Poly Bag',
      type: 'bag',
      currentStock: 200,
      cost: 0.15,
      status: 'active'
    }
  ]);

  const addToReplenishment = (item: PackagingItem) => {
    const reorderPoint = getReorderPoint(item.type);
    const suggestedQuantity = getSuggestedQuantity(item.type, item.currentStock);
    
    const replenishmentItem: ReplenishmentItem = {
      packagingId: item.id,
      name: item.name,
      currentStock: item.currentStock,
      reorderPoint,
      suggestedQuantity,
      quantity: suggestedQuantity,
      unitCost: item.cost,
      totalCost: item.cost * suggestedQuantity,
      supplier: getDefaultSupplier(item.type),
      notes: ''
    };

    setSelectedItems(prev => [...prev, replenishmentItem]);
  };

  const removeFromReplenishment = (packagingId: string) => {
    setSelectedItems(prev => prev.filter(item => item.packagingId !== packagingId));
  };

  const updateReplenishmentItem = (packagingId: string, field: keyof ReplenishmentItem, value: any) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.packagingId === packagingId) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitCost') {
          updated.totalCost = updated.quantity * updated.unitCost;
        }
        return updated;
      }
      return item;
    }));
  };

  const getReorderPoint = (type: string): number => {
    const reorderPoints = {
      'box': 20,
      'envelope': 50,
      'bag': 100,
      'tube': 15,
      'other': 25
    };
    return reorderPoints[type as keyof typeof reorderPoints] || 25;
  };

  const getSuggestedQuantity = (type: string, currentStock: number): number => {
    const reorderPoint = getReorderPoint(type);
    const suggestedQuantities = {
      'box': 100,
      'envelope': 200,
      'bag': 500,
      'tube': 50,
      'other': 100
    };
    return suggestedQuantities[type as keyof typeof suggestedQuantities] || 100;
  };

  const getDefaultSupplier = (type: string): string => {
    const suppliers = {
      'box': 'Packaging Solutions Inc.',
      'envelope': 'Mail Supplies Co.',
      'bag': 'Plastic Packaging Ltd.',
      'tube': 'Tube Packaging Corp.',
      'other': 'General Supplies'
    };
    return suppliers[type as keyof typeof suppliers] || 'General Supplies';
  };

  const getStockStatus = (stock: number, reorderPoint: number) => {
    if (stock === 0) return { status: 'out_of_stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= reorderPoint) return { status: 'low_stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'in_stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const totalCost = selectedItems.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Generate Purchase Order
      const poNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const orderDate = new Date().toISOString();
      
      const purchaseOrder = {
        poNumber,
        orderDate,
        items: selectedItems,
        totalCost,
        status: 'pending',
        supplier: selectedItems[0]?.supplier || 'Multiple Suppliers',
        notes: selectedItems.map(item => `${item.name}: ${item.notes}`).filter(note => note).join('; ')
      };
      
      // Simulate API call to create purchase order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Purchase Order Created:', purchaseOrder);
      
      // Create expense entries for each item (when order is confirmed)
      const expenseEntries = selectedItems.map(item => ({
        expense_id: `EXP-${poNumber}-${item.packagingId}`,
        item_name: item.name,
        category: 'Packaging Materials',
        quantity: item.quantity,
        cost: item.totalCost,
        unit_price: item.unitCost,
        date: orderDate,
        comment: `Purchase Order: ${poNumber} - ${item.supplier}`,
        po_number: poNumber,
        supplier: item.supplier
      }));
      
      console.log('Expense Entries to be created:', expenseEntries);
      
      // Show success message with expense information
      alert(`Purchase Order ${poNumber} created successfully!\n\nTotal Cost: €${totalCost.toFixed(2)}\nStatus: Pending\n\n📊 Expense Tracking:\n• ${expenseEntries.length} expense entries will be created\n• Category: Packaging Materials\n• Total Budget Impact: €${totalCost.toFixed(2)}\n\nThis order will be sent to suppliers for fulfillment.`);
      
      // Redirect back to packaging list
      router.push('/inventory/packaging');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Error creating purchase order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Replenish Packaging</h1>
          <p className="text-gray-600 mt-2">Create replenishment orders for low stock items</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/inventory/packaging')}
          >
            Back to Packaging
          </Button>
          {selectedItems.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Purchase Order...' : `Create Purchase Order (€${totalCost.toFixed(2)})`}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Items</h2>
            <p className="text-sm text-gray-600">Click to add items to replenishment order</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {packagingItems.map((item) => {
                const reorderPoint = getReorderPoint(item.type);
                const stockStatus = getStockStatus(item.currentStock, reorderPoint);
                const isSelected = selectedItems.some(selected => selected.packagingId === item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => isSelected ? removeFromReplenishment(item.id) : addToReplenishment(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">Stock: {item.currentStock}</span>
                          <span className="text-sm text-gray-500">Reorder Point: {reorderPoint}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">€{item.cost.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">per unit</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Replenishment Order */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Replenishment Order</h2>
            <p className="text-sm text-gray-600">{selectedItems.length} items selected</p>
          </div>
          
          {selectedItems.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {selectedItems.map((item) => (
                  <div key={item.packagingId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <button
                        onClick={() => removeFromReplenishment(item.packagingId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateReplenishmentItem(item.packagingId, 'quantity', parseInt(e.target.value) || 0)}
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
                          onChange={(e) => updateReplenishmentItem(item.packagingId, 'unitCost', parseFloat(e.target.value) || 0)}
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
                          onChange={(e) => updateReplenishmentItem(item.packagingId, 'supplier', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Total Cost
                        </label>
                        <div className="px-2 py-1 text-sm font-medium text-gray-900">
                          €{item.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => updateReplenishmentItem(item.packagingId, 'notes', e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Optional notes..."
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                  <span className="text-xl font-bold text-gray-900">€{totalCost.toFixed(2)}</span>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What happens when you create this order:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Purchase Order (PO) will be generated with unique number</li>
                    <li>• Order will be sent to suppliers for confirmation</li>
                    <li>• Expense entries will be created for budget tracking</li>
                    <li>• You'll receive tracking updates as items are shipped</li>
                    <li>• Stock levels will be updated when items are received</li>
                    <li>• Order status can be tracked in your purchase history</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                  <h4 className="text-sm font-medium text-green-900 mb-2">💰 Expense Integration:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Category: <strong>Packaging Materials</strong></li>
                    <li>• Each item becomes a separate expense entry</li>
                    <li>• Linked to Purchase Order for audit trail</li>
                    <li>• Automatically categorized for budget reporting</li>
                    <li>• Visible in Expenses → Expense List</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click on items from the left to add them to your replenishment order.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
