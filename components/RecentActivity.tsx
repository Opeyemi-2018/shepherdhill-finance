/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";

// Shadcn imports
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
  time: string; // raw ISO date for sorting
  displayTime: string; // "2 hours ago" etc.
  status?: string;
  entity_name: string;
  total_amount: number;
  paid_amount?: number;
  balance?: number;
  date: string;
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

        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }

        const json = await res.json();

        if (!json.status) {
          throw new Error(json.message || "Invalid response");
        }

        // Combine invoices + expenses
        const invoiceActivities: Activity[] = json.records.invoices.map(
          (inv: any, index: number) => ({
            id: `inv-${inv.id}-${index}`,
            type: "invoice",
            title: `Invoice #${inv.id} - ${inv.status || "Pending"}`,
            description: `₦${inv.total_amount.toLocaleString()} to ${inv.entity_name}. Balance: ₦${(inv.balance || 0).toLocaleString()}`,
            time: inv.date,
            displayTime: formatDistanceToNow(parseISO(inv.date), {
              addSuffix: true,
            }),
            status: inv.status,
            entity_name: inv.entity_name,
            total_amount: inv.total_amount,
            paid_amount: inv.paid_amount,
            balance: inv.balance,
            date: inv.date,
          }),
        );

        const expenseActivities: Activity[] = json.records.expenses.map(
          (exp: any, index: number) => ({
            id: `exp-${exp.id}-${index}`,
            type: "expense",
            title: `Expense #${exp.id} - ${exp.status || "Pending"}`,
            description: `₦${exp.total_amount.toLocaleString()} to ${exp.entity_name}${exp.description ? ` (${exp.description})` : ""}`,
            time:
              exp.date === "0000-00-00" ? new Date().toISOString() : exp.date,
            displayTime:
              exp.date === "0000-00-00"
                ? "Unknown date"
                : formatDistanceToNow(parseISO(exp.date), { addSuffix: true }),
            status: exp.status,
            entity_name: exp.entity_name,
            total_amount: exp.total_amount,
            date: exp.date,
          }),
        );

        // Merge and sort by date (newest first)
        const allActivities = [...invoiceActivities, ...expenseActivities].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
        );

        // Take most recent 5–10
        setActivities(allActivities.slice(0, 10));

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
          <p className="mb-4 font-medium">
            Invoice #{activity.id.split("-")[1]} for {activity.entity_name}
          </p>
          <p className="mb-3">
            Total: ₦{activity.total_amount.toLocaleString()}
          </p>
          <p className="mb-3">
            Paid: ₦{(activity.paid_amount || 0).toLocaleString()}
          </p>
          <p className="mb-4">
            Outstanding Balance: ₦{(activity.balance || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Status: <strong>{activity.status || "Pending"}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Recorded {activity.displayTime}
          </p>
        </>
      );
    }

    return (
      <>
        <p className="mb-4 font-medium">
          Expense #{activity.id.split("-")[1]} to {activity.entity_name}
        </p>
        <p className="mb-3">
          Amount: ₦{activity.total_amount.toLocaleString()}
        </p>
        <p className="mb-4">
          Status: <strong>{activity.status || "Pending"}</strong>
        </p>
        <p className="text-sm text-gray-500">Recorded {activity.displayTime}</p>
      </>
    );
  };

  return (
    <div className="bg-primary-foreground rounded-xl">
      <div className="py-1 border-b px-6">
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
          {/* Mobile: Shadcn Select Dropdown */}
          <div className="lg:hidden px-6 mb-6">
            <Select
              value={selectedId || ""}
              onValueChange={(value) => setSelectedId(value || null)}
            >
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
            {/* Desktop: Left sidebar list (hidden on mobile) */}
            <div className="hidden lg:block overflow-y-auto border-r">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => setSelectedId(activity.id)}
                  className={cn(
                    "w-full px-3 py-4 text-left transition-colors flex items-start gap-3 hover:bg-background",
                    selectedId === activity.id &&
                      "bg-background border-l-4 border-[#FAB435]",
                  )}
                >
                  <div className="p-2 rounded-full flex-shrink-0 bg-[#FAB435]/10">
                    <Clock className="w-5 h-5 text-[#FAB435]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#3A3A3A] dark:text-white text-[14px] line-clamp-1">
                      {activity.title}
                    </p>
                    <p className="text-[12px] text-[#979797]  mt-1 line-clamp-2">
                      {activity.displayTime}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right - Detail View (always visible) */}
            <div className="p-6 overflow-y-auto bg-background lg:border-l">
              {selectedActivity ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  {getDetailContent(selectedActivity)}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-white">
                  <p className="text-lg font-medium">Select an activity</p>
                  <p className="text-sm mt-2">
                    {activities.length > 0
                      ? "Choose from the list above"
                      : "No activities available"}
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
