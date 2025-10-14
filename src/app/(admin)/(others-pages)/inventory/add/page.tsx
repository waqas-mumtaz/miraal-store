import AddInventoryItem from "@/components/inventory/AddInventoryItem";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Add Inventory Item | Miraal Store - Admin Dashboard",
  description: "Add a new inventory item to track",
};

export default function AddInventoryPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <AddInventoryItem />
        </div>
      </div>
    </div>
  );
}
