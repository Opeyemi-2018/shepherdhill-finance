/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoChevronBackOutline } from "react-icons/io5";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import { FaUserLarge } from "react-icons/fa6";
import { useState, useEffect } from "react";

interface StatementDetail {
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
    email: string;
    address: string;
  };
  creator: {
    id: number;
    name: string;
  } | null;
}

export default function StatementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const statementId = params.id as string;

  const [statement, setStatement] = useState<StatementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatement = async () => {
      if (!token) {
        setError("Authentication token not found. Please log in.");
        toast.error("Please log in to view statement");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
        if (!apiBase) throw new Error("API base URL not configured");

        const res = await fetch(`${apiBase}/statement/details/${statementId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch statement: ${res.status}`);
        }

        const json = await res.json();

        if (!json.status || !json.data) {
          throw new Error(json.message || "Invalid response");
        }

        setStatement(json.data);
      } catch (err: any) {
        console.error("Statement fetch error:", err);
        setError(err.message || "Failed to load statement details");
        toast.error("Could not load statement");
      } finally {
        setLoading(false);
      }
    };

    fetchStatement();
  }, [statementId, token]);

  // ── Download Statement as Text File ─────────────────────────────────────
  const handleDownload = () => {
    if (!statement) {
      toast.error("No statement data available");
      return;
    }

    const content = `
STATEMENT DETAILS
=================

Statement ID     : STM-${statement.id}
Client Name      : ${statement.client.name}
Client Email     : ${statement.client.email}
Client Address   : ${statement.client.address}
Status           : ${statement.status.toUpperCase()}
Created At       : ${new Date(statement.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
Updated At       : ${new Date(statement.updated_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}

Description:
${statement.description || "No description provided."}

Attachment:
${statement.attachment ? statement.attachment : "No attachment available"}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Statement_STM-${statement.id}_${statement.client.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Statement downloaded successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-600 dark:text-green-400";
      case "inactive":
      case "archived":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#FAB435]" />
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="pt-10 text-center">
        <p className="text-red-600 mb-6">{error || "Statement not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pt-2 pb-8">
      <div className="flex md:items-center flex-col gap-4 md:gap-0 md:flex-row justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="bg-primary-foreground hover:text-white text-black dark:text-white dark:hover:text-black"
          >
            <IoChevronBackOutline className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <FaUserLarge className="bg-primary-foreground dark:bg-transparent text-[#FAB435] rounded-full p-2 w-12 h-12" />
            <div>
              <h1 className="md:text-[20px] font-medium">{statement.client.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[14px] text-gray-500">
                  STM-{statement.id} • {statement.client.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="whitespace-nowrap flex items-center gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download Statement
          </Button>
        </div>
      </div>

      <div className="bg-primary-foreground shadow-lg rounded-lg p-6">
        <h2 className="font-bold text-[16px] dark:text-white text-[#3A3A3A] pb-3 border-b border-[#979797]/30 mb-6">
          Statement Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Client Name</p>
            <p className="font-medium text-[14px]">{statement.client.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Client Email</p>
            <p className="font-medium text-[14px]">{statement.client.email}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Statement ID</p>
            <p className="font-medium text-[14px]">STM-{statement.id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Created At</p>
            <p className="font-medium text-[14px]">
              {new Date(statement.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Description</p>
            <p className="font-medium text-[14px]">{statement.description || "—"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Status</p>
            <p className={`font-medium text-[14px] ${getStatusColor(statement.status)}`}>
              • {statement.status.charAt(0).toUpperCase() + statement.status.slice(1)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Attachment</p>
            <p className="font-medium text-[14px]">
              {statement.attachment ? (
                <a
                  href={
                    statement.attachment.startsWith("http")
                      ? statement.attachment
                      : `${process.env.NEXT_PUBLIC_API_URL}/${statement.attachment}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A6DC0] hover:underline"
                >
                  View Attachment
                </a>
              ) : (
                "No attachment"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}