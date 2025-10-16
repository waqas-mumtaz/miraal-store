"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  currentQuantity: number;
  unitCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  linkedExpenses: any[];
  lastReplenishment?: any;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch products: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your product inventory
          </p>
        </div>
        <Link href="/inventory/products/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding your first product.
          </p>
          <div className="mt-6">
            <Link href="/inventory/products/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Add Product
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Unit Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Last Updated</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.currentQuantity > 10 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : product.currentQuantity > 0 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {product.currentQuantity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      {formatCurrency(product.unitCost)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      {formatDate(product.updatedAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link href={`/inventory/products/${product.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/inventory/products/edit/${product.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
