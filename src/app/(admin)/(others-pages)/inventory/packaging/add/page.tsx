import AddPackaging from "@/components/inventory/AddPackaging";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Add Packaging | Miraal Store - Admin Dashboard",
  description: "Add a new packaging item to your inventory",
};

export default function AddPackagingPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <AddPackaging />
        </div>
      </div>
    </div>
  );
}
