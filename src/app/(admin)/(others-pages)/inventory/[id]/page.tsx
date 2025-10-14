import InventoryDetail from "@/components/inventory/InventoryDetail";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Inventory Item Details | Miraal Store - Admin Dashboard",
  description: "View inventory item details and replenishment history",
};

export default function InventoryDetailPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <InventoryDetail />
        </div>
      </div>
    </div>
  );
}
