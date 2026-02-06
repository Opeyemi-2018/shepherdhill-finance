"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

// Dummy data
const activities = [
  {
    id: "act-1",
    title: "Invoice #1024 marked as sent",
    description: "Invoice #1024 has been successfully sent to the client.",
    time: "2025-01-02",
  },
  {
    id: "act-2",
    title: "Receivable updated for GreenField Ltd",
    description:
      "Receivable balance updated after partial payment of ₦1,250,000.",
    time: "2025-01-02",
  },
  {
    id: "act-3",
    title: "Client statement successfully uploaded",
    description:
      "Monthly statement for Q4 2024 uploaded and shared with client.",
    time: "2025-01-02",
  },
  {
    id: "act-4",
    title: "Payable approved for disbursement",
    description: "Vendor payable of ₦850,000 approved and queued for payment.",
    time: "2025-01-02",
  },
  {
    id: "act-5",
    title: "Vendor payment approved for disbursement",
    description: "Payment batch for 3 vendors totaling ₦2,340,000 approved.",
    time: "2025-01-02",
  },
];

// Simple dummy paragraphs for each activity
const getDetailContent = (activity: (typeof activities)[0]) => {
  switch (activity.id) {
    case "act-1":
      return (
        <>
          <p className="mb-4">
            The invoice #1024 for GreenField Ltd has been successfully marked as
            sent. The client should receive the document shortly via email and
            WhatsApp.
          </p>
          <p className="mb-4">
            This action was performed by Admin User at 14:30 on January 2, 2025.
            No delivery issues were reported.
          </p>
          <p>Next step: Await client confirmation of receipt and payment.</p>
        </>
      );

    case "act-2":
      return (
        <>
          <p className="mb-4">
            Receivable account for GreenField Ltd has been updated following a
            partial payment of ₦1,250,000 received today.
          </p>
          <p className="mb-4">
            The new outstanding balance is ₦3,450,000. Payment was applied to
            the oldest invoice first.
          </p>
          <p>
            Transaction reference: PAY-20250102-00123. Receipt has been emailed
            to the client.
          </p>
        </>
      );

    case "act-3":
      return (
        <>
          <p className="mb-4">
            The Q4 2024 client statement has been successfully generated and
            uploaded to the system.
          </p>
          <p className="mb-4">
            The PDF document (1.8 MB) was automatically shared with the client
            via secure email link.
          </p>
          <p>Client access confirmed at 09:45. No bounce-back received.</p>
        </>
      );

    case "act-4":
      return (
        <>
          <p className="mb-4">
            Payable amount of ₦850,000 to vendor has been reviewed and approved
            for disbursement.
          </p>
          <p className="mb-4">
            Approval completed by Finance Manager. Payment is now queued in the
            batch system.
          </p>
          <p>
            Expected disbursement date: January 5, 2025. Vendor will be notified
            upon completion.
          </p>
        </>
      );

    case "act-5":
      return (
        <>
          <p className="mb-4">
            Multi-vendor payment batch totaling ₦2,340,000 has been approved for
            disbursement.
          </p>
          <p className="mb-4">
            The batch includes payments to 3 different vendors. All documents
            verified and approved.
          </p>
          <p>
            Bank transfer will be initiated within the next 24 hours. Tracking
            reference generated.
          </p>
        </>
      );

    default:
      return (
        <p className="text-gray-500">No details available for this activity.</p>
      );
  }
};

const RecentActivities = () => {
  const [selectedId, setSelectedId] = useState<string | null>(
    activities[0]?.id || null,
  );

  const selectedActivity = activities.find((act) => act.id === selectedId);

  return (
    <div className="bg-primary-foreground rounded-xl ">
      <div className="py-1 border-b px-6">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[520px] mt-4">
        <div className="">
          <div className="">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedId(activity.id)}
                className={cn(
                  "w-full px-3 py-4 text-left  transition-colors flex items-start gap-0",
                  selectedId === activity.id &&
                    "bg-white border-l-4 border-[#FAB435]",
                )}
              >
                <div className="p-2 rounded-full flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#FAB435]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3A3A3A] text-[14px] line-clamp-1">
                    {activity.title}
                  </p>
                  <p className="text-[12px] text-[#979797] mt-1 line-clamp-2">
                    {activity.time}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right - Detail View (only paragraphs) */}
        <div className="p-6 overflow-y-auto bg-gray-50">
          {selectedActivity ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              {getDetailContent(selectedActivity)}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p className="text-lg font-medium">Select an activity</p>
              <p className="text-sm mt-2">
                Click any item on the left to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
