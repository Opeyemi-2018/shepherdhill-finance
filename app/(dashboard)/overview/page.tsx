/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import StatCard from "@/components/HeaderCard";
import HeaderContent from "@/components/HeaderContent";
import { FaUserAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import RecentActivities from "@/components/RecentActivity";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/user";

interface ReportSummary {
  grand_total_invoiced: number;
  grand_total_collected: number;
  grand_total_expenses: number;
  net_cash_position: number;
}

const Overview = () => {
  const router = useRouter();
  const { token } = useAuth();

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);

      if (!token) {
        toast.error("Please log in to view dashboard");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/report/overview`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch overview: ${res.status}`);
        }

        const json = await res.json();

        if (!json.status) {
          throw new Error(json.message || "Invalid response from server");
        }

        setSummary(json.summary);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        toast.error(err.message || "Could not load dashboard overview");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [token]);

  // Format currency helper — safe for undefined values
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return "₦0.00";
    return `₦${value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Safe calculation for Outstanding Invoices
  const outstanding = summary
    ? (summary.grand_total_invoiced || 0) - (summary.grand_total_collected || 0)
    : 0;

  return (
    <div className="">
      <HeaderContent
        title="Dashboard"
        description="Start with a clear overview of what matters most"
      />

      <div className="flex justify-between overflow-x-auto gap-4 pt-6">
        <StatCard
          icon={FaUserAlt}
          label="Total Receivables"
          value={
            loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              formatCurrency(summary?.grand_total_invoiced)
            )
          }
        />
        <StatCard
          icon={FaUserAlt}
          label="Total Payables"
          value={
            loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              formatCurrency(summary?.grand_total_expenses)
            )
          }
        />
        <StatCard
          icon={FaUserAlt}
          label="Outstanding Invoices"
          value={
            loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              formatCurrency(outstanding)
            )
          }
        />
        <StatCard
          icon={FaUserAlt}
          label="Cash Received"
          value={
            loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              formatCurrency(summary?.grand_total_collected)
            )
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <button
          onClick={() => router.push("/create-invoice")}
          className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]"
        >
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Create Invoice</h2>
        </button>
        <button
          onClick={() => router.push("/statements/create")}
          className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]"
        >
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Upload Statement</h2>
        </button>
        <button
          onClick={() => router.push("/record-vendor-payment")}
          className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]"
        >
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Record Payment</h2>
        </button>
        <button
          onClick={() => router.push("/create-invoice")}
          className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]"
        >
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Generate Report</h2>
        </button>
      </div>

      <div className="mt-4">
        <RecentActivities />
      </div>
    </div>
  );
};

export default Overview;
