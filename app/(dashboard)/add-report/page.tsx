"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import HeaderContent from "@/components/HeaderContent";

export default function ReportDetailsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  // Dummy vendors (replace with real fetch later if needed)
  const vendors = [
    { id: "1", name: "Tolani Danger" },
    { id: "2", name: "Chicken Republic" },
    { id: "3", name: "Mega Chicken" },
    { id: "4", name: "NNPC Filling Station" },
  ];

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate generation delay (remove in real implementation)
    setTimeout(() => {
      setIsGenerating(false);
      alert("Report generated successfully (demo)");
    }, 2000);
  };

  return (
    <div className="">
      <HeaderContent
        title="Report Details"
        description="Generate reports with required fields marked * compulsory"
      />

      <div className="mt-6  bg-primary-foreground rounded-xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleGenerateReport} className="space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Report Details
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Fields marked with * are compulsory.
            </p>
          </div>

          {/* Select Vendor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              Select Vendor <span className="text-red-500">*</span>
            </label>
            <Select>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select Vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter Payment Amount"
              className="h-12"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd-MM-yy") : "DD-MM-YY"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd-MM-yy") : "DD-MM-YY"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Report Class */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Report Class (Select one)
            </label>
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="client-report" defaultChecked />
                <label
                  htmlFor="client-report"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Client Report
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="vendor-report" />
                <label
                  htmlFor="vendor-report"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Vendor Report
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              className="px-8"
              onClick={() => {} /* router.back() if needed */}
              disabled={isGenerating}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="px-8 bg-[#FAB435] hover:bg-[#e0a027] text-[#1a1a1a]"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}