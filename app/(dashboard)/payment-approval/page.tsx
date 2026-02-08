"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import HeaderContent from "@/components/HeaderContent";

interface PaymentForApproval {
  id: string;
  vendorName: string;
  referenceId: string;
  amountDue: number;
  paymentMethod: string;
  requestedDate: string;
  status: "Pending";
}

const dummyPayments: PaymentForApproval[] = [
  {
    id: "1",
    vendorName: "SwiftSupplies",
    referenceId: "PAY-2041",
    amountDue: 320000,
    paymentMethod: "Bank Transfer",
    requestedDate: "9/01/2026",
    status: "Pending",
  },
  {
    id: "2",
    vendorName: "Alpha Tech Services",
    referenceId: "PAY-2042",
    amountDue: 150000,
    paymentMethod: "Cheque",
    requestedDate: "9/01/2026",
    status: "Pending",
  },
  {
    id: "3",
    vendorName: "SwiftSupplies",
    referenceId: "PAY-2041",
    amountDue: 320000,
    paymentMethod: "Bank Transfer",
    requestedDate: "9/01/2026",
    status: "Pending",
  },
  {
    id: "4",
    vendorName: "SwiftSupplies",
    referenceId: "PAY-2041",
    amountDue: 320000,
    paymentMethod: "Bank Transfer",
    requestedDate: "9/01/2026",
    status: "Pending",
  },
];

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4].map((i) => (
      <tr key={i}>
        <td colSpan={7} className="py-5">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
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

export default function PaymentsForApprovalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading] = useState(false);

  const filteredPayments = dummyPayments.filter((payment) =>
    payment.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.referenceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="">
      <HeaderContent
        title="Payments for Approval"
        description="Review and approve pending vendor payments"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 w-full md:w-auto overflow-x-auto">
            <h2 className="pb-2 px-1 text-sm font-medium border-b-2 border-[#FAB435] text-[#3A3A3A] dark:text-white whitespace-nowrap">
              Payment for Approval
            </h2>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6DC0] w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Reference ID
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Amount Due
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Payment Method
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Requested Date
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Status
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[#9E9A9A] font-dm-sans"
                  >
                    No payments pending approval
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-5 pl-4 text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                      {payment.vendorName}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {payment.referenceId}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      ₦{payment.amountDue.toLocaleString()}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {payment.paymentMethod}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {payment.requestedDate}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px]">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-yellow-700 dark:text-yellow-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                        Pending
                      </span>
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#0A6DC0] hover:text-[#085a9e] hover:bg-blue-50"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center sm:justify-end gap-2 mt-8">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 bg-[#FAB435]/30 text-[#FAB435] border-none"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              3
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              4
            </Button>
          </div>

          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}