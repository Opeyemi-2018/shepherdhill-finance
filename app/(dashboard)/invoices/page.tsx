/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HeaderContent from "@/components/HeaderContent";
import { Loader2 } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoice";

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
  const router = useRouter();
  const { invoices, loading, error } = useInvoices();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "All Invoices" | "Paid" | "Unpaid" | "Draft"
  >("All Invoices");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getInvoiceStatusBadge = (status: string, draft?: string) => {
    let textClass = "text-gray-700 dark:text-gray-400";
    let dotClass = "bg-gray-500";
    let displayText = "";

    const isDraft = draft === "1" || status === "";

    if (isDraft) {
      displayText = "Draft";
      textClass = "text-gray-700 dark:text-gray-400";
      dotClass = "bg-gray-500";
    } else {
      switch (status?.toLowerCase()) {
        case "paid":
          displayText = "Paid";
          textClass = "text-green-700 dark:text-green-400";
          dotClass = "bg-green-500";
          break;
        case "unpaid":
          displayText = "Unpaid";
          textClass = "text-red-700 dark:text-red-400";
          dotClass = "bg-red-500";
          break;
        default:
          displayText =
            status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
      }
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${textClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
        {displayText}
      </span>
    );
  };

  const filteredInvoices = invoices.filter((inv) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      inv.client?.name?.toLowerCase().includes(searchLower) ||
      inv.description?.toLowerCase().includes(searchLower) ||
      `INV-${inv.id}`.toLowerCase().includes(searchLower);

    const isDraft = inv.draft === "1" || inv.status === "";

    let matchesTab = true;
    switch (activeTab) {
      case "Paid":
        matchesTab = inv.status?.toLowerCase() === "paid";
        break;
      case "Unpaid":
        matchesTab = inv.status?.toLowerCase() === "unpaid";
        break;
      case "Draft":
        matchesTab = isDraft;
        break;
      default:
        matchesTab = true;
    }

    return matchesSearch && matchesTab;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentData = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
        <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
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
              ) : currentData.length > 0 ? (
                currentData.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    <td className="py-4 pl-3 whitespace-nowrap text-sm font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {`INV-${invoice.id.toString().padStart(4, "0")}`}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {invoice.client?.name || "Unknown"}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm text-[#3A3A3A] dark:text-[#979797]">
                      {new Date(invoice.invoice_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm font-medium text-[#3A3A3A] dark:text-[#979797]">
                      ₦{Number(invoice.amount).toLocaleString()}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      {getInvoiceStatusBadge(invoice.status, invoice.draft)}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#FAB435] hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInvoice(invoice.id);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-500 dark:text-[#979797]"
                  >
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Only this part was added */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${
                  currentPage === page ? "bg-[#FAB435]/30 text-[#FAB435]" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
