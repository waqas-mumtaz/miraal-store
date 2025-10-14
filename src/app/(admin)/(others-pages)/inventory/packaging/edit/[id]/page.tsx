import EditPackaging from "@/components/inventory/EditPackaging";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Edit Packaging | Miraal Store - Admin Dashboard",
  description: "Edit packaging inventory information",
};

export default function EditPackagingPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <EditPackaging />
        </div>
      </div>
    </div>
  );
}
