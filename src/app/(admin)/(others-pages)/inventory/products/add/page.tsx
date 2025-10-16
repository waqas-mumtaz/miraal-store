import { AddProduct } from "@/components/inventory/product";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Add Product | Miraal Store - Admin Dashboard",
  description: "Add a new product to your inventory",
};

export default function AddProductPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <AddProduct />
        </div>
      </div>
    </div>
  );
}
