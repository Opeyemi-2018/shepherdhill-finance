/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HeaderContent from "@/components/HeaderContent";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import { cn } from "@/lib/utils";

interface Statement {
  id: number;
  client_id: string;
  description: string | null;
  attachment: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    name: string;
  };
  creator: {
    id: number;
    name: string;
  } | null;
}

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

export default function StatementTable() {
  const router = useRouter();
  const { token } = useAuth();

  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStatements = async () => {
      if (!token) {
        setError("Authentication token not found. Please log in.");
        toast.error("Please log in to view statements");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/statement/all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch statements: ${res.status}`);
        }

        const json = await res.json();

        if (!json.status) {
          throw new Error(json.message || "Invalid response");
        }

        setStatements(json.data || []);
      } catch (err: any) {
        console.error("Statements fetch error:", err);
        setError(err.message || "Failed to load statements");
        toast.error("Could not load statements");
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, [token]);

  const filteredStatements = statements.filter((stmt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      stmt.client?.name?.toLowerCase().includes(q) ||
      stmt.description?.toLowerCase().includes(q) ||
      `STM-${stmt.id}`.toLowerCase().includes(q)
    );
  });

  const handleViewStatement = (id: number) => {
    router.push(`/banking/${id}`);
  };

  const handleAddStatement = () => {
    router.push("/create-statement");
  };

  // ── Download Statement Details ─────────────────────────────────────
  const handleDownload = (stmt: Statement) => {
    const content = `
STATEMENT DETAILS
=================

Statement ID     : STM-${stmt.id}
Description      : ${stmt.description || "No description"}
Status           : ${stmt.status.toUpperCase()}
Created At       : ${new Date(stmt.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
Updated At       : ${new Date(stmt.updated_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}

Attachment URL:
${stmt.attachment || "No attachment available"}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Statement_STM-${stmt.id}_${(stmt.client?.name || "Client").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded Statement STM-${stmt.id}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div>
      <HeaderContent
        title="Statements"
        description="View and manage all client statements"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 w-full md:w-auto overflow-x-auto">
            <button className="pb-2 px-4 text-sm font-medium border-b-2 border-[#FAB435] text-[#3A3A3A] dark:text-white">
              All Statements
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search by client or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              onClick={handleAddStatement}
              className="bg-[#FAB435]/30 text-[#E89500] whitespace-nowrap"
            >
              Add Statement
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Statement ID
                </th>
               
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Description
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Created At
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
              ) : filteredStatements.length > 0 ? (
                filteredStatements.map((stmt) => (
                  <tr
                    key={stmt.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 pl-3 whitespace-nowrap text-sm font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {`STM-${stmt.id.toString().padStart(4, "0")}`}
                    </td>
                  
                    <td className="py-4 text-sm text-[#3A3A3A] dark:text-[#979797]">
                      {stmt.description || "—"}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-1 text-xs font-medium rounded-full",
                          stmt.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {stmt.status?.charAt(0).toUpperCase() + stmt.status?.slice(1) || "Unknown"}
                      </span>
                    </td>
                    <td className="py-4 whitespace-nowrap text-sm text-[#3A3A3A] dark:text-[#979797]">
                      {formatDate(stmt.created_at)}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#E89500] hover:bg-blue-50"
                          onClick={() => handleViewStatement(stmt.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#E89500] hover:bg-amber-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(stmt);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-500 dark:text-[#979797]"
                  >
                    No statements found
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
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
}