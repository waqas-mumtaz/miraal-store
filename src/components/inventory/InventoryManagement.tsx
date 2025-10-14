"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  currentQuantity: number;
  unitCost: number;
  totalCOG: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  linkedExpenses: {
    id: string;
    allocatedCost: number;
    expense: {
      id: string;
      title: string;
      date: string;
      totalAmount: number;
    };
  }[];
  lastReplenishment?: {
    id: string;
    quantity: number;
    cost: number;
    date: string;
  } | null;
}

interface Packaging {
  id: string;
  name: string;
  description?: string;
  type: string;
  currentQuantity: number;
  unitCost: number;
  totalCOG: number;
  linkedProducts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  linkedExpenses: {
    id: string;
    allocatedCost: number;
    expense: {
      id: string;
      title: string;
      date: string;
      totalAmount: number;
    };
  }[];
  lastReplenishment?: {
    id: string;
    quantity: number;
    cost: number;
    date: string;
  } | null;
}

export default function InventoryManagement() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'products' | 'packaging'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [packagingItems, setPackagingItems] = useState<Packaging[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Set initial tab based on URL
  useEffect(() => {
    if (pathname.includes('/packaging')) {
      setActiveTab('packaging');
    } else {
      setActiveTab('products');
    }
  }, [pathname]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (activeTab === 'products') {
        console.log('Fetching products...');
        const response = await fetch('/api/products');
        const data = await response.json();
        console.log('Products response:', { status: response.status, data });

        if (!response.ok) {
          setError(data.error || 'Failed to fetch products');
          return;
        }

        setProducts(data.products || []);
      } else {
        console.log('Fetching packaging...');
        const response = await fetch('/api/packaging');
        const data = await response.json();
        console.log('Packaging response:', { status: response.status, data });

        if (!response.ok) {
          setError(data.error || 'Failed to fetch packaging items');
          return;
        }

        setPackagingItems(data.packagingItems || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQuantityStatus = (quantity: number) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' };
    } else if (quantity <= 10) {
      return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' };
    } else {
      return { label: 'In Stock', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Inventory Management
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your products and packaging inventory with COG calculation
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'products' ? (
            <Link
              href="/inventory/products/add"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </Link>
          ) : (
            <Link
              href="/inventory/packaging/add"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Packaging
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('packaging')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'packaging'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Packaging ({packagingItems.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'products' ? (
          <ProductsTable products={products} formatCurrency={formatCurrency} formatDate={formatDate} getQuantityStatus={getQuantityStatus} />
        ) : (
          <PackagingTable packagingItems={packagingItems} formatCurrency={formatCurrency} formatDate={formatDate} getQuantityStatus={getQuantityStatus} />
        )}
      </div>
    </div>
  );
}

// Products Table Component
function ProductsTable({ products, formatCurrency, formatDate, getQuantityStatus }: {
  products: Product[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getQuantityStatus: (quantity: number) => { label: string; color: string };
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No products found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Get started by adding your first product.
        </p>
        <Link
          href="/inventory/products/add"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add First Product
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Product</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">SKU</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quantity</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Unit Cost</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Total COG</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Linked Expenses</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getQuantityStatus(product.currentQuantity);
            const totalValue = product.currentQuantity * product.unitCost;
            
            return (
              <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </span>
                    {product.description && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {product.description}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-900 dark:text-white">
                  {product.sku || '-'}
                </td>
                <td className="py-4 px-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.currentQuantity}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-900 dark:text-white">
                  {formatCurrency(product.unitCost)}
                </td>
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                  {formatCurrency(product.totalCOG)}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.linkedExpenses.length} expense{product.linkedExpenses.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/inventory/products/${product.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/inventory/products/edit/${product.id}`}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      title="Edit Product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    {product.currentQuantity === 0 && (
                      <Link
                        href={`/inventory/products/${product.id}?replenish=true`}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        title="Replenish Now"
                      >
                        Replenish
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Packaging Table Component
function PackagingTable({ packagingItems, formatCurrency, formatDate, getQuantityStatus }: {
  packagingItems: Packaging[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getQuantityStatus: (quantity: number) => { label: string; color: string };
}) {
  if (packagingItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No packaging items found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Get started by adding your first packaging item.
        </p>
        <Link
          href="/inventory/packaging/add"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add First Packaging
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Packaging</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quantity</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Unit Cost</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Total COG</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Linked Products</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {packagingItems.map((item) => {
            const status = getQuantityStatus(item.currentQuantity);
            const totalValue = item.currentQuantity * item.unitCost;
            
            return (
              <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                    {item.type}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.currentQuantity}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-900 dark:text-white">
                  {formatCurrency(item.unitCost)}
                </td>
                <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">
                  {formatCurrency(item.totalCOG)}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.linkedProducts.length} product{item.linkedProducts.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/inventory/packaging/${item.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/inventory/packaging/edit/${item.id}`}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      title="Edit Packaging"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    {item.currentQuantity === 0 && (
                      <Link
                        href={`/inventory/packaging/${item.id}?replenish=true`}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        title="Replenish Now"
                      >
                        Replenish
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
