"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface Invoice {
  id: string;
  invoice_number: string;
  supplier_name: string;
  supplier_url?: string;
  date: string;
  total_amount?: number;
  pdf_link: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditInvoice() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [formData, setFormData] = useState({
    invoice_number: "",
    supplier_name: "",
    supplier_url: "",
    date: "",
    total_amount: "",
    pdf_link: "",
    comments: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        setError('Failed to load invoice data');
        setIsLoadingData(false);
        return;
      }

      const invoice: Invoice = await response.json();
      
      setFormData({
        invoice_number: invoice.invoice_number,
        supplier_name: invoice.supplier_name,
        supplier_url: invoice.supplier_url || "",
        date: invoice.date,
        total_amount: invoice.total_amount?.toString() || "",
        pdf_link: invoice.pdf_link,
        comments: invoice.comments || "",
      });
      
      setIsLoadingData(false);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to load invoice data');
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.invoice_number || !formData.supplier_name || !formData.pdf_link) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate data types
      const totalAmount = parseFloat(formData.total_amount);
      
      if (formData.total_amount && (isNaN(totalAmount) || totalAmount < 0)) {
        setError("Total amount must be a non-negative number");
        setIsLoading(false);
        return;
      }

      // Call API to update invoice
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          invoice_number: formData.invoice_number,
          supplier_name: formData.supplier_name,
          supplier_url: formData.supplier_url || null,
          date: formData.date,
          total_amount: formData.total_amount ? totalAmount : null,
          pdf_link: formData.pdf_link,
          comments: formData.comments || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update invoice');
        setIsLoading(false);
        return;
      }

      setSuccess('Invoice updated successfully!');
      setTimeout(() => {
        router.push('/expenses/invoices');
      }, 1500);

    } catch (error) {
      console.error('Update invoice error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading invoice data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Invoice</h1>
        <p className="text-gray-600 dark:text-gray-400">Update invoice information and details.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 px-4 py-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Label>Invoice Number *</Label>
            <Input
              type="text"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleInputChange}
              placeholder="Enter invoice number"
            />
          </div>

          <div>
            <Label>Supplier Name *</Label>
            <Input
              type="text"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
            />
          </div>

          <div>
            <Label>Supplier URL</Label>
            <Input
              type="url"
              name="supplier_url"
              value={formData.supplier_url}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label>Date *</Label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Total Amount</Label>
            <Input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step={0.01}
              min="0"
            />
          </div>

          <div>
            <Label>PDF Link *</Label>
            <Input
              type="url"
              name="pdf_link"
              value={formData.pdf_link}
              onChange={handleInputChange}
              placeholder="https://example.com/invoice.pdf"
            />
          </div>

          <div className="lg:col-span-2">
            <Label>Comments</Label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              placeholder="Enter any additional comments"
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5"
          >
            {isLoading ? 'Updating...' : 'Update Invoice'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/expenses/invoices')}
            disabled={isLoading}
            className="px-6 py-2.5"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
