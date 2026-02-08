"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import HeaderContent from "@/components/HeaderContent";
import { useRouter } from "next/navigation";

export default function ReportPreviewPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen pb-12">
      <HeaderContent
        title="Report Preview"
        description="View and manage your generated finance reports"
      />

      <div className="mt-6 bg-primary-foreground rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Report Preview
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 border-[#FAB435]/30 text-[#FAB435] hover:bg-[#FAB435]/10"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={() => router.push("/add-report")}
                className="gap-2 bg-[#FAB435] hover:bg-[#e0a027] text-[#1a1a1a]"
              >
                <Plus className="h-4 w-4" />
                Add Report
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            View Finance Reports
          </p>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-4 pl-6 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  All Invoices
                </th>
                <th className="py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Client Name
                </th>
                <th className="py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Amount Invoiced
                </th>
                <th className="py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Amount Received
                </th>
                <th className="py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Outstanding
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-5 pl-6 text-sm font-medium text-foreground">
                  INV-1024
                </td>
                <td className="py-5 text-sm text-foreground">ABC Logistics</td>
                <td className="py-5 text-sm text-foreground">INV-1024</td>
                <td className="py-5 text-sm font-medium text-foreground">
                  ₦250,000
                </td>
                <td className="py-5 text-sm font-medium text-foreground">
                  ₦250,000
                </td>
                <td className="py-5 text-sm font-medium text-destructive">
                  NO
                </td>
              </tr>

              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-5 pl-6 text-sm font-medium text-foreground">
                  INV-1025
                </td>
                <td className="py-5 text-sm text-foreground">GreenField Ltd</td>
                <td className="py-5 text-sm text-foreground">INV-1025</td>
                <td className="py-5 text-sm font-medium text-foreground">
                  ₦180,000
                </td>
                <td className="py-5 text-sm font-medium text-foreground">
                  ₦100,000
                </td>
                <td className="py-5 text-sm font-medium text-destructive">
                  ₦80,000
                </td>
              </tr>

              <tr className="hover:bg-muted/30 transition-colors">
                <td className="py-5 pl-6 text-sm font-medium text-foreground">
                  INV-1026
                </td>
                <td className="py-5 text-sm text-foreground">
                  MedPlus Services
                </td>
                <td className="py-5 text-sm text-foreground">INV-1026</td>
                <td className="py-5 text-sm font-medium text-foreground">
                  ₦95,000
                </td>
                <td className="py-5 text-sm font-medium text-foreground">₦0</td>
                <td className="py-5 text-sm font-medium text-destructive">
                  ₦95,000
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination placeholder */}
        <div className="p-6 border-t border-border flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Showing 1-3 of 3 entries
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#FAB435]/20 text-[#FAB435] border-[#FAB435]/30"
            >
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
