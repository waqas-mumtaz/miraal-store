"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

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

export default function ViewInvoice() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
        setIsLoading(false);
        return;
      }

      const invoiceData: Invoice = await response.json();
      setInvoice(invoiceData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to load invoice data');
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchInvoice()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Not Found</h3>
          <p className="text-gray-600 mb-4">The requested invoice could not be found.</p>
          <Button onClick={() => router.push('/expenses/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
          <p className="text-gray-600">Invoice #{invoice.invoice_number}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/expenses/invoices')}
          >
            Back to List
          </Button>
          <Button
            onClick={() => router.push(`/expenses/invoices/edit/${invoice.id}`)}
          >
            Edit Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                    <dd className="text-sm text-gray-900 font-mono">{invoice.invoice_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(invoice.date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="text-sm text-gray-900 font-semibold">{formatCurrency(invoice.total_amount)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Supplier Name</dt>
                    <dd className="text-sm text-gray-900">{invoice.supplier_name}</dd>
                  </div>
                  {invoice.supplier_url && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Supplier URL</dt>
                      <dd className="text-sm">
                        <a 
                          href={invoice.supplier_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 underline"
                        >
                          {invoice.supplier_url}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Links</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">PDF Link</dt>
                    <dd className="text-sm">
                      <a 
                        href={invoice.pdf_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 underline"
                      >
                        View PDF Document
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              {invoice.comments && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.comments}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{formatDate(invoice.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">{formatDate(invoice.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}