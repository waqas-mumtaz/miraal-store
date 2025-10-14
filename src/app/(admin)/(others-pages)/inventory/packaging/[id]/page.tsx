import PackagingDetail from "@/components/inventory/PackagingDetail";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Packaging Details | Miraal Store - Admin Dashboard",
  description: "View and manage packaging inventory details",
};

export default function PackagingDetailPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <PackagingDetail />
        </div>
      </div>
    </div>
  );
}
