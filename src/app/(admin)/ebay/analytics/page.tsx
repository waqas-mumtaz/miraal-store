"use client";

import EbayIntegration from '@/components/ebay/EbayIntegration';

export default function EbayAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">eBay Analytics</h1>
        <p className="text-gray-600 mt-2">View your eBay sales performance and insights</p>
      </div>

      {/* eBay Integration */}
      <EbayIntegration />

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">
            This feature is coming soon. You&apos;ll be able to view detailed analytics about your eBay sales performance here.
          </p>
        </div>
      </div>
    </div>
  );
}
