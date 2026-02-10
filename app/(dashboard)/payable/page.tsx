/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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

  // Modal state for payable details
  const [selectedPayableId, setSelectedPayableId] = useState<number | null>(
    null,
  );
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
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch payables: ${response.status}`);
        }

        const json = await response.json();

        if (
          !json.status ||
          !json.data?.data ||
          !Array.isArray(json.data.data)
        ) {
          throw new Error(json.message || "Invalid response format");
        }

        const mapped: Payable[] = json.data.data.map((item: any) => ({
          id: item.id,
          vendorName: item.vendor?.name || "Unknown Vendor",
          amount: Number(item.amount) || 0,
          status: item.status || "pending",
          expenseDate:
            item.expense_date && item.expense_date !== "0000-00-00"
              ? item.expense_date
              : item.created_at.split("T")[0],
        }));

        setPayables(mapped);
      } catch (err: any) {
        console.error("Fetch payables error:", err);
        const msg = err.message || "Could not load payables";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPayables();
  }, [token]);

  const filteredPayables = payables.filter((item) =>
    item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    let textClass = "text-gray-700 dark:text-gray-400";
    let dotClass = "bg-gray-500";

    switch (status?.toLowerCase()) {
      case "approved":
      case "paid":
        textClass = "text-green-700 dark:text-green-400";
        dotClass = "bg-green-500";
        break;
      case "pending":
        textClass = "text-yellow-700 dark:text-yellow-400";
        dotClass = "bg-yellow-500";
        break;
      case "rejected":
        textClass = "text-red-700 dark:text-red-400";
        dotClass = "bg-red-500";
        break;
      default:
        textClass = "text-gray-700 dark:text-gray-400";
        dotClass = "bg-gray-500";
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${textClass}`}
      >
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
    // Refresh table after approve
    setPayables((prev) =>
      prev.map((p) =>
        p.id === selectedPayableId ? { ...p, status: "approved" } : p,
      ),
    );
  };

  // Optional: refresh vendors after adding new one (if you fetch vendors elsewhere)
  const handleVendorCreated = () => {
    // If you have a vendors list or refetch logic here, trigger it
    toast.success("New vendor added — you can now select it");
  };

  return (
    <div className="">
      <HeaderContent
        title="Payables Overview"
        description="Track amounts owed to vendors and payment status"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6">
        <div className="flex flex-col justify-between mb-4 sm:flex-row">
          <div className="mb-4">
            <h2 className="text-[14px] font-bold text-[#3A3A3A] font-dm-sans border-b-2 border-[#FAB435] inline-block pb-1">
              Payment Info
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full flex items-center sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by vendor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6DC0] w-full"
              />
            </div>

            <Button
              onClick={() => router.push("/record-vendors-payment")}
              className="bg-[#FAB435]/30 text-[#E89500]"
            >
              Record Vendor Payment
            </Button>

            {/* Add Vendor Button + Modal */}
            <AddVendorModal
              trigger={
                <Button
                  variant="outline"
                  className="border-[#FAB435]/30 text-[#E89500]"
                >
                  Add Vendor
                </Button>
              }
              onVendorCreated={handleVendorCreated}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Vendor
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Amount
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Status
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Expense Date
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filteredPayables.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[#9E9A9A] font-dm-sans"
                  >
                    No payables found matching your search
                  </td>
                </tr>
              ) : (
                filteredPayables.map((item) => (
                  <tr key={item.id} className="transition-colors">
                    <td className="py-5 pl-4 text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                      {item.vendorName}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      ₦{Number(item.amount).toLocaleString()}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px]">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {new Date(item.expenseDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
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

        {/* Pagination placeholder */}
        <div className="flex items-center justify-center sm:justify-end gap-2 mt-8">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 bg-[#FAB435]/30 text-[#FAB435] border-none"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              3
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              4
            </Button>
          </div>

          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
