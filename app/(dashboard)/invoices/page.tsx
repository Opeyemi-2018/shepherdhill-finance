/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import HeaderContent from "@/components/HeaderContent";
import { useAuth } from "@/context/user";
import { Loader2 } from "lucide-react";
import { fetchInvoices } from "@/actions/invoice";

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={6} className="py-4">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default function InvoiceTable() {
  const { token } = useAuth();
  const router = useRouter();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All Invoices" | "Paid" | "Unpaid" | "Draft">("All Invoices");

  useEffect(() => {
    const loadInvoices = async () => {
      if (!token) {
        setError("Please log in to view invoices");
        setLoading(false);
        return;
      }

      const result = await fetchInvoices(token);

      if (!result.success) {
        setError(result.error || "Failed to load invoices");
        setLoading(false);
        return;
      }

      // Use the "all" array from response
      setInvoices(result.data.data.all || []);
      setLoading(false);
    };

    loadInvoices();
  }, [token]);

  const getInvoiceStatusBadge = (status: string) => {
    let textClass = "text-gray-700 dark:text-gray-400";
    let dotClass = "bg-gray-500";

    switch (status?.toLowerCase()) {
      case "paid":
        textClass = "text-green-700 dark:text-green-400";
        dotClass = "bg-green-500";
        break;
      case "partial":
      case "sent":
        textClass = "text-blue-700 dark:text-blue-400";
        dotClass = "bg-blue-500";
        break;
      case "draft":
        textClass = "text-gray-700 dark:text-gray-400";
        dotClass = "bg-gray-500";
        break;
      case "overdue":
        textClass = "text-red-700 dark:text-red-400";
        dotClass = "bg-red-500";
        break;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${textClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredInvoices = invoices.filter((inv) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      inv.client?.name?.toLowerCase().includes(searchLower) ||
      inv.description?.toLowerCase().includes(searchLower) ||
      `INV-${inv.id}`.toLowerCase().includes(searchLower);

    const tabLower = activeTab.toLowerCase();

    const matchesTab =
      activeTab === "All Invoices" ? true :
      tabLower === "paid" ? inv.status?.toLowerCase() === "paid" :
      tabLower === "unpaid" ? inv.status?.toLowerCase() === "unpaid" :
      tabLower === "draft" ? inv.status?.toLowerCase() === "draft" :
      true;

    return matchesSearch && matchesTab;
  });

  const handleViewInvoice = (id: number) => {
    router.push(`/invoices/${id}`);
  };

  return (
    <div>
      <HeaderContent
        title="Invoices"
        description="View and manage all your invoices"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 w-full md:w-auto overflow-x-auto">
            {["All Invoices", "Paid", "Unpaid", "Draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[#FAB435] text-[#3A3A3A] dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search by client or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
            <Button
              onClick={() => router.push("/create-invoice")}
              className="bg-[#FAB435] hover:bg-[#E89500] text-black hover:text-white whitespace-nowrap"
            >
              Create Invoice
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Client Name
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 pl-3 whitespace-nowrap text-sm font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {`INV-${invoice.id.toString().padStart(4, '0')}`}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {invoice.client?.name || "Unknown"}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm text-[#3A3A3A] dark:text-[#979797]">
                      {new Date(invoice.invoice_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm font-medium text-[#3A3A3A] dark:text-[#979797]">
                      ₦{Number(invoice.amount).toLocaleString()}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      {getInvoiceStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0A6DC0] hover:text-[#085a9e] hover:bg-blue-50"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-[#979797]">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
            &lt;
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-[#FAB435]/30 text-[#FAB435]">
            1
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            2
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
}