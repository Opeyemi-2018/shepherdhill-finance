/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import HeaderContent from "@/components/HeaderContent";

interface ReportRecord {
  type: "receivable" | "payable";
  id: number;
  entity_name: string;
  total_amount: number;
  paid_amount?: number;
  balance?: number;
  status?: string;
  description?: string | null;
  date: string;
}

interface ReportData {
  summary: {
    grand_total_invoiced: number;
    grand_total_collected: number;
    grand_total_expenses: number;
    net_cash_position: number;
  };
  records: {
    invoices: ReportRecord[];
    expenses: ReportRecord[];
  };
}

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={6} className="py-5">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/12"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default function ReportOverviewTable() {
  const router = useRouter();
  const { token } = useAuth();

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Tabs & Pagination
  const [activeTab, setActiveTab] = useState<"all" | "receivable" | "payable">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;        // ← Changed to 5 as you requested

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        toast.error("Please log in to view reports");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/overview`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();

        if (!json.status) {
          throw new Error(json.message || "Failed to fetch report data");
        }

        setData(json);
        setCurrentPage(1);
      } catch (err: any) {
        console.error("Report fetch error:", err);
        setError(err.message || "Failed to load overview report");
        toast.error("Could not load report overview");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  // Flatten and filter records
  const allRecords: ReportRecord[] = useMemo(() => {
    if (!data) return [];
    return [
      ...data.records.invoices.map((inv) => ({ ...inv, type: "receivable" as const })),
      ...data.records.expenses.map((exp) => ({ ...exp, type: "payable" as const })),
    ];
  }, [data]);

  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    if (activeTab === "receivable") {
      result = result.filter((rec) => rec.type === "receivable");
    } else if (activeTab === "payable") {
      result = result.filter((rec) => rec.type === "payable");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((rec) =>
        rec.entity_name.toLowerCase().includes(q) ||
        (rec.status && rec.status.toLowerCase().includes(q)) ||
        rec.date.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allRecords, activeTab, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentData = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string | undefined, type: "receivable" | "payable") => {
    if (type === "payable") {
      if (status === "approved") return <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Approved</span>;
      if (status === "pending") return <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
      return <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status || "Unknown"}</span>;
    }

    if (status === "paid") return <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Paid</span>;
    return <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Unpaid</span>;
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "0000-00-00") return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleViewDetail = (record: ReportRecord) => {
    if (record.type === "receivable") {
      router.push(`/invoices/${record.id}`);
    } else {
      router.push(`/expenses/${record.id}`);
    }
  };

  return (
    <div>
      <HeaderContent title="Report Preview" description="View Finance Reports" />

      <div className="bg-background shadow-lg rounded-lg p-4 md:p-6">
        {/* Tabs */}
        <div className="flex  mb-6">
          {(["all", "receivable", "payable"] as const).map((tab) => (
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
              {tab === "all" ? "All Transactions" : tab === "receivable" ? "Receivables" : "Payables"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search by entity, status or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-5"
          />
        </div>

        <div className="overflow-x-auto bg-primary-foreground rounded-lg">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-background">
              <tr>
                <th className="py-4 pl-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid / Balance</th>
                <th className="py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-red-600">{error}</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No records found</td>
                </tr>
              ) : (
                currentData.map((rec) => (
                  <tr
                    key={`${rec.type}-${rec.id}`}
                    className="hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-none"
                    onClick={() => handleViewDetail(rec)}
                  >
                    <td className="py-5 pl-4 whitespace-nowrap text-sm font-medium capitalize">
                      {rec.type}
                    </td>
                    <td className="py-5 text-sm font-medium">{rec.entity_name}</td>
                    <td className="py-5 text-sm">{formatDate(rec.date)}</td>
                    <td className="py-5 text-sm font-medium">{`₦${rec.total_amount.toLocaleString()}`}</td>
                    <td className="py-5 text-sm">
                      {rec.type === "receivable" ? (
                        <>
                          Paid: ₦{(rec.paid_amount || 0).toLocaleString()}<br />
                          Bal: ₦{(rec.balance || 0).toLocaleString()}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-5">
                      {getStatusBadge(rec.status, rec.type)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Shows 5 per page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

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

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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