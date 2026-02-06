/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import HeaderContent from "@/components/HeaderContent";

interface Receivable {
  id: string;
  clientName: string;
  amountInvoiced: string;
  amountReceived: string;
  outstandingBalance: string;
}

const dummyReceivables: Receivable[] = [
  {
    id: "1",
    clientName: "ABC Transport",
    amountInvoiced: "₦250,000",
    amountReceived: "₦200,000",
    outstandingBalance: "₦50,000",
  },
  {
    id: "2",
    clientName: "GreenField Ltd",
    amountInvoiced: "₦250,000",
    amountReceived: "₦200,000",
    outstandingBalance: "₦50,000",
  },
  {
    id: "3",
    clientName: "MedPlus Services",
    amountInvoiced: "₦250,000",
    amountReceived: "₦200,000",
    outstandingBalance: "₦50,000",
  },
  {
    id: "4",
    clientName: "Swift Supplies",
    amountInvoiced: "₦250,000",
    amountReceived: "₦200,000",
    outstandingBalance: "₦50,000",
  },
  {
    id: "5",
    clientName: "ABC Transport",
    amountInvoiced: "₦250,000",
    amountReceived: "₦200,000",
    outstandingBalance: "₦50,000",
  },
  {
    id: "6",
    clientName: "GreenField Ltd",
    amountInvoiced: "₦250,000",
    amountReceived: "₦200,000",
    outstandingBalance: "₦50,000",
  },
  {
    id: "7",
    clientName: "MedPlus Services",
    amountInvoiced: "₦250,000",
    amountReceived: "₦200,000",
    outstandingBalance: "₦50,000",
  },
];

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={4} className="py-5">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default function ReceivablesBreakdownPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading] = useState(false);

  const filteredReceivables = dummyReceivables.filter((item) =>
    item.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="">
      <HeaderContent
        title="Receivables Breakdown"
        description="Track invoiced amounts, received payments, and outstanding balances"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6">
        <div className="flex flex-col justify-between mb-4 sm:flex-row">
          <div className="mb-4">
            <h2 className="text-[14px] font-bold text-[#3A3A3A] font-dm-sans border-b-2 border-[#FAB435] inline-block pb-1">
              Receivables Breakdown
            </h2>
          </div>
          <div className="relative w-full flex items-center sm:w-72">
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
          <table className="w-full">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Client
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Amount Invoiced
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Amount Received
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Outstanding Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : filteredReceivables.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-[#9E9A9A] font-dm-sans"
                  >
                    No receivables found matching your search
                  </td>
                </tr>
              ) : (
                filteredReceivables.map((item) => (
                  <tr key={item.id} className="transition-colors">
                    <td className="py-5 pl-4 text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                      {item.clientName}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {item.amountInvoiced}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {item.amountReceived}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {item.outstandingBalance}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
