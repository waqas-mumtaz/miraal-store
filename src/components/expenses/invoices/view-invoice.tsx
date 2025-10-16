"use client";
import React from "react";

export default function ViewInvoice() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h1>
        <p className="text-gray-600 dark:text-gray-400">View detailed information about this invoice.</p>
      </div>

      {/* Content will be added here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Invoice Details Coming Soon</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This page will display comprehensive invoice information including items, totals, and payment status.
        </p>
      </div>
    </div>
  );
}
