import { EditProduct } from "@/components/inventory/product";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Edit Product | Miraal Store - Admin Dashboard",
  description: "Edit product inventory information",
};

export default function EditProductPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <EditProduct />
        </div>
      </div>
    </div>
  );
}
