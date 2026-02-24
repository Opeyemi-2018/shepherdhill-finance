/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/user"; // adjust path if needed
import { toast } from "sonner";

interface SOP {
  id: number;
  title: string;
  clientName: string;
  location: string;
  effectiveDate: string;
  hasItems?: boolean; // optional - for future styling if needed
}

const ITEMS_PER_PAGE = 5;

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={5} className="py-6">
          <div className="flex gap-6 animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-5/12"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default function SOPOverviewPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSOPs = async () => {
    if (!token) {
      setError("Please log in to view SOPs");
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_CLIENT_URL}/client/sop`,
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
        throw new Error(`Failed to fetch SOPs: ${response.status}`);
      }

      const json = await response.json();

      if (!json.status || !json.data?.sop_data) {
        throw new Error(json.message || "Invalid response format");
      }

      // Map ALL sop_data entries - no filtering
      const mapped: SOP[] = json.data.sop_data.map((item: any) => ({
        id: item.id,
        title: item.items?.title || "Untitled SOP",
        clientName: item.client?.name || "Unknown Client",
        location: item.location || "—",
        effectiveDate: item.start_date
          ? new Date(item.start_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Not set",
        hasItems: !!item.items, // optional flag
      }));

      setSops(mapped);
    } catch (err: any) {
      console.error("Fetch SOPs error:", err);
      const msg = err.message || "Could not load SOPs";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOPs();
  }, [token]);

  // Filter (search)
  const filteredSOPs = sops.filter(
    (sop) =>
      sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredSOPs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSOPs = filteredSOPs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleView = (id: number) => {
    router.push(`/sop/${id}`); // ← change this to your actual SOP detail route
    // Examples: `/sops/${id}`, `/dashboard/sop/${id}`, `/sops/view/${id}`
  };

  const handleCreate = () => {
    router.push("/create-sop"); // ← match your create route
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#3A3A3A] dark:text-white tracking-tight">
          SOP Overview
        </h1>
        <p className="text-[#9E9A9A] dark:text-gray-400 mt-1.5">
          View and manage all active Standard Operating Procedures
        </p>
      </div>

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6 border border-gray-200 dark:border-gray-800">
        {/* Search & Controls */}
        <div className="flex flex-col justify-between mb-4 sm:flex-row gap-4">
          <div>
            <h2 className="text-[14px] font-bold text-[#3A3A3A] dark:text-white font-dm-sans border-b-2 border-[#FAB435] inline-block pb-1">
              SOP List
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full flex items-center sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by title, client or location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset pagination on search
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#FAB435]/40 dark:focus:ring-[#FAB435]/30 w-full bg-white dark:bg-gray-900 text-[#2F2F2F] dark:text-[#979797]"
              />
            </div>

            <Button
              className="bg-[#FAB435]/30 hover:bg-[#FAB435]/50 text-[#E89500] border-[#FAB435]/30 rounded-xl"
              onClick={handleCreate}
            >
              Create New SOP
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  SOP Title
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Client Name
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Location/Site
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Effective Date
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30 dark:divide-gray-800">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-red-600 dark:text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : paginatedSOPs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[#9E9A9A] dark:text-gray-400 font-medium"
                  >
                    {searchQuery
                      ? "No SOPs match your search"
                      : "No SOPs found. Create one to get started."}
                  </td>
                </tr>
              ) : (
                paginatedSOPs.map((sop) => (
                  <tr
                    key={sop.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="py-5 pl-4 text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                      {sop.title}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {sop.clientName}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {sop.location}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {sop.effectiveDate}
                    </td>
                    <td className="py-5 pr-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#FAB435]/10 hover:bg-[#FAB435]/20 text-[#E89500] border-[#FAB435]/30 dark:bg-[#FAB435]/15 dark:hover:bg-[#FAB435]/30 dark:text-[#FAB435] rounded-lg px-5 py-1.5 text-xs font-medium transition-colors"
                        onClick={() => handleView(sop.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - only shown when needed */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center sm:justify-end gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
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
                        ? "bg-[#FAB435]/30 text-[#FAB435] border-none dark:bg-[#FAB435]/20"
                        : ""
                    }`}
                    onClick={() => goToPage(page)}
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
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
