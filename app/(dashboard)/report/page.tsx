/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import HeaderContent from "@/components/HeaderContent";

interface ReportRecord {
  type: "receivable" | "payable";
  id: number;
  entity_name: string;
  total_amount: number;
  paid_amount?: number; // only for receivable
  balance?: number; // only for receivable
  status?: string;
  description?: string | null; // only for payable
  date: string;
}

interface ReportData {
  status: boolean;
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
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <tr key={i}>
        <td colSpan={7} className="py-4">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/12"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/12"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/12"></div>
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
        const apiBase = process.env.NEXT_PUBLIC_API_URL;
        const url = `${apiBase}/report/overview`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        if (!json.status) {
          throw new Error(json.message || "Failed to fetch report data");
        }

        setData(json);
      } catch (err: any) {
        console.error("Report fetch error:", err);
        setError(err.message || "Failed to load overview report");
        toast.error("Could not load report overview");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Flatten invoices + expenses into one list
  const allRecords: ReportRecord[] = data
    ? [
        ...data.records.invoices.map((inv) => ({
          ...inv,
          type: "receivable" as const,
        })),
        ...data.records.expenses.map((exp) => ({
          ...exp,
          type: "payable" as const,
        })),
      ]
    : [];

  // Apply search filter
  const filteredRecords = allRecords.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.entity_name.toLowerCase().includes(q) ||
      (rec.status && rec.status.toLowerCase().includes(q)) ||
      rec.date.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (
    status: string | undefined,
    type: "receivable" | "payable",
  ) => {
    if (type === "payable") {
      if (status === "approved") {
        return (
          <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      }
      if (status === "pending") {
        return (
          <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      }
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          {status || "Unknown"}
        </span>
      );
    }

    // Receivable
    if (status === "paid") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Paid
        </span>
      );
    }
    if (status === "partial") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Partial
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Unpaid
      </span>
    );
  };

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    // Customize route based on type & id
    if (record.type === "receivable") {
      router.push(`/invoices/${record.id}`);
    } else {
      router.push(`/expenses/${record.id}`);
    }
  };

  return (
    <div>
      <HeaderContent
        title="Report Preview"
        description="View Finance Reports"
      />

      <div className="bg-background shadow-lg rounded-lg p-4 md:p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search by entity, status or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-5 "
          />
        </div>

        <div className="overflow-x-auto bg-primary-foreground">
          <table className="w-full min-w-[900px]">
            <thead className="bg-background">
              <tr>
                <th className="py-3 pl-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid / Balance
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={`${rec.type}-${rec.id}`}
                    className="hover:bg-primary-foreground transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(rec)}
                  >
                    <td className="py-4 pl-4 whitespace-nowrap text-sm font-medium">
                      {rec.type === "receivable" ? "Receivable" : "Payable"}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm">
                      {rec.entity_name}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(rec.total_amount)}
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm">
                      {rec.type === "receivable" ? (
                        <>
                          Paid: {formatCurrency(rec.paid_amount || 0)}
                          <br />
                          Bal: {formatCurrency(rec.balance || 0)}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      {getStatusBadge(rec.status, rec.type)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
