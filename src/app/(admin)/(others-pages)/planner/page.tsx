"use client";

import Link from "next/link";
import Button from "@/components/ui/button/Button";

export default function PlannerPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Plans</h1>
          <p className="text-gray-600">Choose a marketplace to manage your product plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* eBay Plans Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">eBay Plans</h2>
                <p className="text-gray-600">Manage your eBay product listings</p>
              </div>
            </div>
            <p className="text-gray-500 mb-6">
              Create and manage product plans for eBay marketplace with commission, VAT, and advertising calculations.
            </p>
            <div className="flex space-x-3">
              <Link href="/planner/ebay">
                <Button variant="outline" className="w-full">
                  View eBay Plans
                </Button>
              </Link>
              <Link href="/planner/add">
                <Button className="w-full">
                  Add Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Amazon Plans Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Amazon Plans</h2>
                <p className="text-gray-600">Manage your Amazon product listings</p>
              </div>
            </div>
            <p className="text-gray-500 mb-6">
              Create and manage product plans for Amazon marketplace with fulfillment, storage fees, and commission calculations.
            </p>
            <div className="flex space-x-3">
              <Link href="/planner/amazon">
                <Button variant="outline" className="w-full">
                  View Amazon Plans
                </Button>
              </Link>
              <Link href="/planner/add">
                <Button className="w-full">
                  Add Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/planner/ebay" className="block">
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">eBay Plans</p>
                    <p className="text-xs text-gray-500">View all eBay plans</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/planner/amazon" className="block">
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-orange-300 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Amazon Plans</p>
                    <p className="text-xs text-gray-500">View all Amazon plans</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/planner/add" className="block">
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add New Plan</p>
                    <p className="text-xs text-gray-500">Create a new product plan</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
