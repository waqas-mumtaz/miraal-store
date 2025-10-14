import InventoryManagement from "@/components/inventory/InventoryManagement";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Inventory Management | Miraal Store - Admin Dashboard",
  description: "Manage your products and packaging inventory with COG calculation",
};

export default function InventoryPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <InventoryManagement />
        </div>
      </div>
    </div>
  );
}
