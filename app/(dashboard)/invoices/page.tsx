"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import HeaderContent from "@/components/HeaderContent";

interface Invoice {
  id: string;
  invoiceId: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  description: string;
  invoiceDate: string;
  amount: number;
  status: "Paid" | "Sent" | "Draft" | "Overdue";
}

const invoiceData: Invoice[] = [
  {
    id: "1",
    invoiceId: "INV-1024",
    clientName: "ABC Logistics",
    clientEmail: "abclogistics@gmail.com",
    phone: "08011223868",
    description: "Field Service",
    invoiceDate: "2026-01-12",
    amount: 250000,
    status: "Paid",
  },
  {
    id: "2",
    invoiceId: "INV-1024",
    clientName: "ABC Logistics",
    clientEmail: "abclogistics@gmail.com",
    phone: "08011223868",
    description: "Field Service",
    invoiceDate: "2026-01-12",
    amount: 250000,
    status: "Paid",
  },
  {
    id: "3",
    invoiceId: "INV-1024",
    clientName: "ABC Logistics",
    clientEmail: "abclogistics@gmail.com",
    phone: "08011223868",
    description: "Field Service",
    invoiceDate: "2026-01-12",
    amount: 250000,
    status: "Paid",
  },
  {
    id: "4",
    invoiceId: "INV-1025",
    clientName: "GreenField Ltd",
    clientEmail: "greenfield@gmail.com",
    phone: "08011223869",
    description: "Security Service",
    invoiceDate: "2026-01-14",
    amount: 250000,
    status: "Sent",
  },
  {
    id: "5",
    invoiceId: "INV-1026",
    clientName: "MedPlus Services",
    clientEmail: "medplus@gmail.com",
    phone: "08011223870",
    description: "Medical Service",
    invoiceDate: "2026-01-15",
    amount: 250000,
    status: "Draft",
  },
  {
    id: "6",
    invoiceId: "INV-1027",
    clientName: "Swift Supplies",
    clientEmail: "swift@gmail.com",
    phone: "08011223871",
    description: "Supply Service",
    invoiceDate: "2026-01-17",
    amount: 250000,
    status: "Overdue",
  },
  {
    id: "7",
    invoiceId: "INV-1026",
    clientName: "MedPlus Services",
    clientEmail: "medplus@gmail.com",
    phone: "08011223870",
    description: "Medical Service",
    invoiceDate: "2026-01-15",
    amount: 250000,
    status: "Draft",
  },
  {
    id: "8",
    invoiceId: "INV-1025",
    clientName: "GreenField Ltd",
    clientEmail: "greenfield@gmail.com",
    phone: "08011223869",
    description: "Security Service",
    invoiceDate: "2026-01-14",
    amount: 250000,
    status: "Sent",
  },
  {
    id: "9",
    invoiceId: "INV-1026",
    clientName: "MedPlus Services",
    clientEmail: "medplus@gmail.com",
    phone: "08011223870",
    description: "Medical Service",
    invoiceDate: "2026-01-15",
    amount: 250000,
    status: "Draft",
  },
  {
    id: "10",
    invoiceId: "INV-1024",
    clientName: "ABC Logistics",
    clientEmail: "abclogistics@gmail.com",
    phone: "08011223868",
    description: "Field Service",
    invoiceDate: "2026-01-12",
    amount: 250000,
    status: "Paid",
  },
  {
    id: "11",
    invoiceId: "INV-1027",
    clientName: "Swift Supplies",
    clientEmail: "swift@gmail.com",
    phone: "08011223871",
    description: "Supply Service",
    invoiceDate: "2026-01-17",
    amount: 250000,
    status: "Overdue",
  },
  {
    id: "12",
    invoiceId: "INV-1026",
    clientName: "MedPlus Services",
    clientEmail: "medplus@gmail.com",
    phone: "08011223870",
    description: "Medical Service",
    invoiceDate: "2026-01-15",
    amount: 250000,
    status: "Draft",
  },
];

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "All Invoices" | "Paid" | "Unpaid" | "Draft"
  >("All Invoices");

  const getInvoiceStatusBadge = (status: string) => {
    const statusConfig = {
      Paid: {
        text: "text-green-700 dark:text-green-400",
        dot: "bg-green-500",
      },
      Sent: {
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
      },
      Draft: {
        text: "text-gray-700 dark:text-gray-400",
        dot: "bg-gray-500",
      },
      Overdue: {
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.Draft;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${config.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {status}
      </span>
    );
  };

  const filteredInvoices = invoiceData.filter((invoice) => {
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "All Invoices"
        ? true
        : activeTab === "Paid"
          ? invoice.status === "Paid"
          : activeTab === "Unpaid"
            ? invoice.status === "Sent" || invoice.status === "Overdue"
            : activeTab === "Draft"
              ? invoice.status === "Draft"
              : true;

    return matchesSearch && matchesTab;
  });

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  return (
    <div>
      <HeaderContent
        title="Dashboard"
        description="Start with a clear overview of what matters most"
      />
      <div className="bg-primary-foreground shadow-lg rounded-lg p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 w-full md:w-auto">
            {["All Invoices", "Paid", "Unpaid", "Draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[#FAB435] text-[#3A3A3A] dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search by client name..."
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Client Name
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Amount
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-destructive">
                    Error loading invoice data
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="dark:hover:!bg-black transition-colors"
                  >
                    <td className="py-4 pl-3 whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {invoice.invoiceId}
                    </td>
                    <td className="py-4 whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {invoice.clientName}
                    </td>
                    <td className="py-4 whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {new Date(invoice.invoiceDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="py-4 whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      ₦{invoice.amount.toLocaleString()}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      {getInvoiceStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 whitespace-nowrap text-[12px] sm:text-[14px] font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0A6DC0] hover:text-[#085a9e] hover:bg-blue-50"
                        onClick={() => handleViewInvoice(invoice.id)}
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
                    {invoiceData.length === 0
                      ? "No invoice data available"
                      : "No invoices match your search criteria"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center  gap-2 mt-8">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
            &lt;
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-[#FAB435]/30 text-[#FAB435]"
          >
            1
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            2
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            3
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            4
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
}
