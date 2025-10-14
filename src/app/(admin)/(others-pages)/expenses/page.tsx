import ExpenseList from "@/components/expenses/ExpenseList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Expense List | Miraal Store - Admin Dashboard",
  description: "View and manage all your expenses in the Miraal Store admin dashboard",
};

export default function ExpensesPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Expenses
        </h3>
        <div className="space-y-6">
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}
