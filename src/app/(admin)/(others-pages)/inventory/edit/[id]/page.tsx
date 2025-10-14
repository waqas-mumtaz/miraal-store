import EditInventoryItem from "@/components/inventory/EditInventoryItem";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Edit Inventory Item | Miraal Store - Admin Dashboard",
  description: "Edit inventory item details",
};

export default function EditInventoryPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <EditInventoryItem />
        </div>
      </div>
    </div>
  );
}
