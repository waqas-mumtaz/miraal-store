"use client";
import React, { useState } from "react";
import Link from "next/link";
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
}

export default function InvoiceList() {
  // Dummy data for UI development
  const [invoices] = useState<Invoice[]>([
    {
      id: "1",
      invoice_number: "INV-2024-001",
      supplier_name: "Tech Solutions Ltd",
      supplier_url: "https://techsolutions.com",
      date: "2024-01-15",
      total_amount: 1250.00,
      pdf_link: "https://example.com/invoices/inv-001.pdf",
      comments: "Monthly software license renewal",
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      invoice_number: "INV-2024-002",
      supplier_name: "Office Supplies Co",
      supplier_url: "https://officesupplies.com",
      date: "2024-01-20",
      total_amount: 89.50,
      pdf_link: "https://example.com/invoices/inv-002.pdf",
      comments: "Office stationery and supplies",
      createdAt: "2024-01-20T14:15:00Z"
    },
    {
      id: "3",
      invoice_number: "INV-2024-003",
      supplier_name: "Cloud Services Inc",
      supplier_url: "https://cloudservices.com",
      date: "2024-01-25",
      total_amount: 450.00,
      pdf_link: "https://example.com/invoices/inv-003.pdf",
      comments: "Cloud hosting and storage services",
      createdAt: "2024-01-25T09:45:00Z"
    },
    {
      id: "4",
      invoice_number: "INV-2024-004",
      supplier_name: "Marketing Agency",
      date: "2024-01-30",
      total_amount: 2100.00,
      pdf_link: "https://example.com/invoices/inv-004.pdf",
      comments: "Digital marketing campaign",
      createdAt: "2024-01-30T16:20:00Z"
    },
    {
      id: "5",
      invoice_number: "INV-2024-005",
      supplier_name: "Legal Services",
      supplier_url: "https://legalservices.com",
      date: "2024-02-05",
      total_amount: 750.00,
      pdf_link: "https://example.com/invoices/inv-005.pdf",
      comments: "Contract review and consultation",
      createdAt: "2024-02-05T11:10:00Z"
    }
  ]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice List</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your invoices and billing information.</p>
          </div>
          <Link href="/expenses/invoices/add">
            <Button className="px-4 py-2">
              Add Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  PDF Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {invoice.supplier_name}
                    </div>
                    {invoice.supplier_url && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <a 
                          href={invoice.supplier_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-brand-500"
                        >
                          {invoice.supplier_url}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(invoice.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={invoice.pdf_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300"
                    >
                      View PDF
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {invoice.comments || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/expenses/invoices/${invoice.id}`}>
                        <Button variant="outline" className="px-3 py-1 text-xs">
                          View
                        </Button>
                      </Link>
                      <Link href={`/expenses/invoices/edit/${invoice.id}`}>
                        <Button variant="outline" className="px-3 py-1 text-xs">
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

      {invoices.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No invoices found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first invoice.
          </p>
        </div>
      )}
    </div>
  );
}
