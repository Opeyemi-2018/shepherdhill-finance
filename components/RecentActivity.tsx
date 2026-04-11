/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Activity {
  id: string;
  type: "invoice" | "expense";
  title: string;
  description: string;
  time: string;
  displayTime: string;
  status?: string;
  entity_name: string;
  total_amount: number;
  paid_amount?: number;
  balance?: number;
}

const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRecentActivities = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Authentication required");
        toast.error("Please log in to view recent activities");
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

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const json = await res.json();

        if (!json.status || !json.records) {
          throw new Error(json.message || "Invalid response");
        }

        // Map Invoices
        const invoiceActivities: Activity[] = (json.records.invoices || []).map(
          (inv: any) => ({
            id: `inv-${inv.id}`,
            type: "invoice" as const,
            title: `Invoice #${inv.id}`,
            description: `₦${Number(inv.total_amount || 0).toLocaleString()} to ${inv.entity_name || "Client"}`,
            time: inv.date || inv.created_at || new Date().toISOString(),
            displayTime: formatDistanceToNow(
              parseISO(inv.date || inv.created_at || new Date().toISOString()),
              { addSuffix: true },
            ),
            status: inv.status,
            entity_name: inv.entity_name || "Unknown",
            total_amount: Number(inv.total_amount || 0),
            paid_amount: Number(inv.paid_amount || 0),
            balance: Number(inv.balance || 0),
          }),
        );

        // Map Expenses
        const expenseActivities: Activity[] = (json.records.expenses || []).map(
          (exp: any) => ({
            id: `exp-${exp.id}`,
            type: "expense" as const,
            title: `Expense #${exp.id}`,
            description: `₦${Number(exp.total_amount || 0).toLocaleString()} to ${exp.entity_name || "Vendor"}${exp.description ? ` - ${exp.description}` : ""}`,
            time: exp.date || exp.created_at || new Date().toISOString(),
            displayTime: formatDistanceToNow(
              parseISO(exp.date || exp.created_at || new Date().toISOString()),
              { addSuffix: true },
            ),
            status: exp.status,
            entity_name: exp.entity_name || "Unknown",
            total_amount: Number(exp.total_amount || 0),
          }),
        );

        // Combine both and sort by newest first
        const allActivities = [...invoiceActivities, ...expenseActivities].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
        );

        setActivities(allActivities.slice(0, 10)); // Show latest 10

        if (allActivities.length > 0) {
          setSelectedId(allActivities[0].id);
        }
      } catch (err: any) {
        console.error("Recent activities fetch error:", err);
        setError(err.message || "Failed to load recent activities");
        toast.error("Could not load recent activities");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [token]);

  const selectedActivity = activities.find((act) => act.id === selectedId);

  const getDetailContent = (activity: Activity) => {
    if (activity.type === "invoice") {
      return (
        <>
          <p className="mb-4 font-medium text-lg">Invoice Details</p>
          <p className="mb-3">
            Client: <strong>{activity.entity_name}</strong>
          </p>
          <p className="mb-3">
            Total Amount:{" "}
            <strong>₦{activity.total_amount.toLocaleString()}</strong>
          </p>
          <p className="mb-3">
            Paid:{" "}
            <strong>₦{(activity.paid_amount || 0).toLocaleString()}</strong>
          </p>
          <p className="mb-4">
            Outstanding:{" "}
            <strong>₦{(activity.balance || 0).toLocaleString()}</strong>
          </p>
          <p>
            Status:{" "}
            <strong className="capitalize">
              {activity.status || "Pending"}
            </strong>
          </p>
        </>
      );
    }

    // Expense
    return (
      <>
        <p className="mb-4 font-medium text-lg">Expense Details</p>
        <p className="mb-3">
          Vendor: <strong>{activity.entity_name}</strong>
        </p>
        <p className="mb-4">
          Amount: <strong>₦{activity.total_amount.toLocaleString()}</strong>
        </p>
        <p>
          Status:{" "}
          <strong className="capitalize">{activity.status || "Pending"}</strong>
        </p>
      </>
    );
  };

  return (
    <div className="bg-primary-foreground rounded-xl">
      <div className="py-4 border-b px-6">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[520px]">
          <Loader2 className="h-10 w-10 animate-spin text-[#FAB435]" />
        </div>
      ) : error ? (
        <div className="h-[520px] flex flex-col items-center justify-center text-red-600">
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">Please try refreshing the page</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="h-[520px] flex flex-col items-center justify-center text-gray-500">
          <p className="text-lg font-medium">No recent activities</p>
          <p className="text-sm mt-2">
            New invoices or expenses will appear here
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {/* Mobile Select */}
          <div className="lg:hidden px-6 mb-6">
            <Select value={selectedId || ""} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.title} • {activity.displayTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 h-[520px]">
            {/* Left Sidebar - List */}
            <div className="hidden lg:block overflow-y-auto border-r">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => setSelectedId(activity.id)}
                  className={cn(
                    "w-full px-4 py-4 text-left transition-colors flex items-start gap-3 hover:bg-background border-l-4 border-transparent",
                    selectedId === activity.id &&
                      "bg-background border-[#FAB435]",
                  )}
                >
                  <div className="p-2 rounded-full flex-shrink-0 bg-[#FAB435]/10 mt-0.5">
                    <Clock className="w-5 h-5 text-[#FAB435]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#3A3A3A] dark:text-white text-[14px] line-clamp-1">
                      {activity.title}
                    </p>
                    <p className="text-[12px] text-[#979797] mt-1 line-clamp-2">
                      {activity.displayTime}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail View */}
            <div className="p-6 overflow-y-auto bg-background lg:border-l">
              {selectedActivity ? (
                <div className="prose prose-sm max-w-none dark:text-white">
                  {getDetailContent(selectedActivity)}
                  <p className="text-sm text-gray-500 mt-6">
                    Recorded {selectedActivity.displayTime}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p className="text-lg font-medium">Select an activity</p>
                  <p className="text-sm mt-2">
                    Choose from the list on the left
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
