import { ProductList } from "@/components/inventory/product";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Products | Miraal Store - Admin Dashboard",
  description: "Manage your product inventory with COG calculation",
};

export default function ProductsPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <ProductList />
        </div>
      </div>
    </div>
  );
}
