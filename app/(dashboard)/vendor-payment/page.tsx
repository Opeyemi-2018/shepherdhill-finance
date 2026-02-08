"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { CalendarIcon, Paperclip, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import HeaderContent from "@/components/HeaderContent";

export default function RecordPaymentPage() {
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Dummy vendors (replace with real fetch later if needed)
  const vendors = [
    { id: "1", name: "Tolani Danger" },
    { id: "2", name: "Chicken Republic" },
    { id: "3", name: "Mega Chicken" },
    { id: "4", name: "NNPC Filling Station" },
  ];

  const handleFileUpload = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG, JPEG, PNG files are allowed");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay (remove in real implementation)
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Payment recorded successfully (demo)");
    }, 1500);
  };

  return (
    <div className="">
      <HeaderContent
        title="Record Payment"
        description="Record vendor payments and upload receipts"
      />

      <div className="mt-6  bg-primary-foreground rounded-xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Vendor</label>
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
            <label className="text-sm font-medium text-foreground">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter Payment Amount"
              className="h-12"
            />
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Payment Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "dd-MM-yy") : "DD-MM-YY"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Enter Payment Details</label>
            <Textarea
              placeholder="Enter Payment Description"
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Upload Payment Receipt</label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 md:p-12 text-center transition-colors cursor-pointer",
                isDragging ? "border-[#FAB435] bg-[#FAB435]/5" : "border-border hover:border-[#FAB435]/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("receipt-upload")?.click()}
            >
              {uploadedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium text-foreground">{uploadedFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                  >
                    Remove file
                  </Button>
                </div>
              ) : (
                <>
                  <Paperclip className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Upload Receipt (PDF, JPG)</p>
                  <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
                  <input
                    type="file"
                    id="receipt-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                  />
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              className="px-8"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="px-8 bg-[#FAB435] hover:bg-[#e0a027] text-[#1a1a1a]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as pending"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}