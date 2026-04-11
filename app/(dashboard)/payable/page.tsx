/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import HeaderContent from "@/components/HeaderContent";
import { useAuth } from "@/context/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PayableDetailModal } from "./chunks/PayableModal";
import { AddVendorModal } from "./chunks/Addvendors";

interface Payable {
  id: number;
  vendorName: string;
  amount: number | string;
  status: string;
  expenseDate: string;
  attachment?: string | null;
}

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={5} className="py-5">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default function PayablesOverviewPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [payables, setPayables] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Tab & Pagination State
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [selectedPayableId, setSelectedPayableId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayables = async () => {
      if (!token) {
        setError("Please log in to view payables");
        setLoading(false);
        toast.error("Authentication required");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payables/overview`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error(`Failed: ${response.status}`);

        const json = await response.json();

        if (!json.status || !json.data?.data) {
          throw new Error(json.message || "Invalid response");
        }

        const mapped: Payable[] = json.data.data.map((item: any) => ({
          id: item.id,
          vendorName: item.vendor?.name || "Unknown Vendor",
          amount: Number(item.amount) || 0,
          status: item.status || "pending",
          expenseDate: item.expense_date || item.created_at?.split("T")[0] || "",
          attachment: item.attachment || null,
        }));

        setPayables(mapped);
        setCurrentPage(1); // Reset to first page on new fetch
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not load payables");
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchPayables();
  }, [token]);

  // Filter by tab + search
  const filteredPayables = useMemo(() => {
    let result = [...payables];

    // Filter by tab
    if (activeTab === "approved") {
      result = result.filter((p) => p.status.toLowerCase() === "approved");
    } else if (activeTab === "pending") {
      result = result.filter((p) => p.status.toLowerCase() === "pending");
    }

    // Filter by search
    if (searchQuery.trim()) {
      result = result.filter((item) =>
        item.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [payables, activeTab, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayables.length / itemsPerPage);
  const currentData = filteredPayables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    let textClass = "text-gray-700";
    let dotClass = "bg-gray-500";

    if (lowerStatus === "approved" || lowerStatus === "paid") {
      textClass = "text-green-700";
      dotClass = "bg-green-500";
    } else if (lowerStatus === "pending") {
      textClass = "text-yellow-700";
      dotClass = "bg-yellow-500";
    } else if (lowerStatus === "rejected") {
      textClass = "text-red-700";
      dotClass = "bg-red-500";
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${textClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handlePreview = (id: number) => {
    setSelectedPayableId(id);
    setModalOpen(true);
  };

  const handleStatusChange = () => {
    // Optimistic update
    setPayables((prev) =>
      prev.map((p) =>
        p.id === selectedPayableId ? { ...p, status: "approved" } : p
      )
    );
  };

  const handleVendorCreated = () => {
    toast.success("New vendor added successfully");
    // You can refetch here if needed
  };

  return (
    <div className="">
      <HeaderContent
        title="Payables Overview"
        description="Track amounts owed to vendors and payment status"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6">
        {/* Header + Search + Buttons */}
        <div className="flex flex-col justify-between mb-6 sm:flex-row gap-4">
          <div>
            <h2 className="text-[14px] font-bold text-[#3A3A3A] font-dm-sans border-b-2 border-[#FAB435] inline-block pb-1">
              Payment Info
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by vendor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6DC0]"
              />
            </div>

            <Button
              onClick={() => router.push("/record-vendors-payment")}
              className="bg-[#FAB435]/30 text-[#E89500] whitespace-nowrap"
            >
              Record Vendor Payment
            </Button>

            <AddVendorModal
              trigger={
                <Button variant="outline" className="border-[#FAB435]/30 text-[#E89500]">
                  Add Vendor
                </Button>
              }
              onVendorCreated={handleVendorCreated}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          {(["all", "approved", "pending"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#FAB435] text-[#FAB435] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="">
              <tr>
                <th className="py-3 pl-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Date</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#9E9A9A]">
                    No payables found
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="">
                    <td className="py-5 pl-4 text-[15px] font-medium dark:text-white">
                      {item.vendorName}
                    </td>
                    <td className="py-5 text-[15px] dark:text-white">
                      ₦{Number(item.amount).toLocaleString()}
                    </td>
                    <td className="py-5">{getStatusBadge(item.status)}</td>
                    <td className="py-5 text-[15px] dark:text-white">
                      {new Date(item.expenseDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#FAB435]/10 hover:bg-[#FAB435]/20 text-[#E89500] border-[#FAB435]/30"
                        onClick={() => handlePreview(item.id)}
                      >
                        Preview
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center sm:justify-end gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={`h-9 w-9 ${currentPage === page ? "bg-[#FAB435]/30 text-[#FAB435] border-none" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <PayableDetailModal
        payableId={selectedPayableId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}