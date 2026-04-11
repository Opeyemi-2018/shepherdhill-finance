/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import HeaderContent from "@/components/HeaderContent";
import { useAuth } from "@/context/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Receivable {
  id: number;
  clientName: string;
  amountInvoiced: number | string;
  amountReceived: number | string;
  outstandingBalance: number | string;
  attachment: string | null;
}

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={5} className="py-5">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default function ReceivablesBreakdownPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchReceivables = async () => {
      if (!token) {
        setError("Please log in to view receivables");
        setLoading(false);
        toast.error("Authentication required");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/receivable/overview`,
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
          throw new Error(`Failed to fetch receivables: ${response.status}`);
        }

        const json = await response.json();

        if (!json.status || !json.data?.data) {
          throw new Error(json.message || "Invalid response format");
        }

        const mapped: Receivable[] = json.data.data.map((item: any) => ({
          id: item.id,
          clientName: item.client?.name || "Unknown Client",
          amountInvoiced: item.invoice?.amount || item.amount || "0",
          amountReceived:
            Number(item.invoice?.amount || 0) - Number(item.balance || 0),
          outstandingBalance: item.balance || "0",
          attachment: item.attachment || null,
        }));

        setReceivables(mapped);
        setCurrentPage(1); // Reset to first page when data loads
      } catch (err: any) {
        console.error("Fetch receivables error:", err);
        const msg = err.message || "Could not load receivables";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchReceivables();
  }, [token]);

  // Filter + Pagination Logic
  const filteredReceivables = receivables.filter((item) =>
    item.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredReceivables.length / itemsPerPage);

  const currentData = filteredReceivables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getAttachmentUrl = (attachment: string | null): string => {
    if (!attachment) return "#";
    const cleanPath = attachment.startsWith("/")
      ? attachment.slice(1)
      : attachment;
    return `http://shepherdhill.edubiller.com/public/${cleanPath}`;
  };

  return (
    <div className="">
      <HeaderContent
        title="Receivables Breakdown"
        description="Track invoiced amounts, received payments, and outstanding balances"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6">
        <div className="flex flex-col justify-between mb-4 sm:flex-row">
          <div className="mb-4">
            <h2 className="text-[14px] font-bold text-[#3A3A3A] font-dm-sans border-b-2 border-[#FAB435] inline-block pb-1">
              Receivables Breakdown
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full flex items-center sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6DC0] w-full"
              />
            </div>
            <Button
              onClick={() => router.push("/client-payment")}
              className="bg-[#FAB435]/30 text-[#E89500]"
            >
              Record Payment +
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Client
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Amount Invoiced
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Amount Received
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Outstanding Balance
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
              ) : currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[#9E9A9A] font-dm-sans"
                  >
                    No receivables found matching your search
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="transition-colors">
                    <td className="py-5 pl-4 text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                      {item.clientName}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      ₦{Number(item.amountInvoiced).toLocaleString()}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      ₦{Number(item.amountReceived).toLocaleString()}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      ₦{Number(item.outstandingBalance).toLocaleString()}
                    </td>
                    <td className="py-5">
                      {item.attachment ? (
                        <a
                          href={getAttachmentUrl(item.attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#FAB435] hover:underline"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No attachment
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Only added this part */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center sm:justify-end gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 ${
                      currentPage === page
                        ? "bg-[#FAB435]/30 text-[#FAB435] border-none"
                        : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
