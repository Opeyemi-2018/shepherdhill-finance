/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { CalendarIcon, Paperclip, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import HeaderContent from "@/components/HeaderContent";
import { useAuth } from "@/context/user";
import { toast } from "sonner";
import { createPayableAction } from "@/actions/payments";

interface Vendor {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function CreatePayablePage() {
  const router = useRouter();
  const { token } = useAuth();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState<string | null>(null);

  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [description, setDescription] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      if (!token) {
        setVendorsError("Please sign in to view vendors");
        setVendorsLoading(false);
        toast.error("Authentication required");
        return;
      }

      try {
        setVendorsLoading(true);
        setVendorsError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payables/vendors`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch vendors (${response.status})`);
        }

        const json = await response.json();

        if (!json.status || !Array.isArray(json.data)) {
          throw new Error(json.message || "Invalid vendors response");
        }

        setVendors(json.data);
      } catch (err: any) {
        const msg = err.message || "Could not load vendors";
        setVendorsError(msg);
        toast.error(msg);
      } finally {
        setVendorsLoading(false);
      }
    };

    fetchVendors();
  }, [token]);

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, JPG, JPEG, PNG files are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setUploadedFile(file);
    toast.success("Attachment added");
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
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVendorId) {
      toast.error("Please select a vendor");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!token) {
      toast.error("Please sign in to create payable");
      router.push("/sign-in");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("vendor_id", selectedVendorId);
      formData.append("amount", amount);
      if (expenseDate) {
        formData.append("expense_date", format(expenseDate, "yyyy-MM-dd"));
      }
      if (paymentDate) {
        formData.append("payment_date", format(paymentDate, "yyyy-MM-dd"));
      }
      if (paymentDetails.trim()) {
        formData.append("payment_details", paymentDetails.trim());
      }
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (uploadedFile) {
        formData.append("attachment", uploadedFile);
      }

      const result = await createPayableAction(formData, token);

      if (!result.success) {
        toast.error(result.error || "Failed to create payable");
        return;
      }

      toast.success(result.message || "Payable created successfully!");
      router.push("/payable"); // adjust redirect path as needed
    } catch (err: any) {
      console.error("Create payable error:", err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12">
      <HeaderContent
        title="Create Payable"
        description="Record a new vendor payment or expense"
      />

      <div className="mt-6 bg-primary-foreground rounded-xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Select – Loader only here */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Vendor <span className="text-red-500">*</span>
            </label>

            {vendorsLoading ? (
              <div className="h-12 flex items-center justify-center gap-2 border rounded-md bg-muted/30">
                <Loader2 className="h-5 w-5 animate-spin text-[#FAB435]" />
                <span className="text-muted-foreground text-sm">
                  Loading vendors...
                </span>
              </div>
            ) : vendorsError ? (
              <div className="h-12 flex items-center px-4 border rounded-md bg-red-50 text-red-700 text-sm">
                {vendorsError}
              </div>
            ) : vendors.length === 0 ? (
              <div className="h-12 flex items-center px-4 border rounded-md bg-yellow-50 text-yellow-800 text-sm">
                No vendors found
              </div>
            ) : (
              <Select
                value={selectedVendorId}
                onValueChange={setSelectedVendorId}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent className="">
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-12"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Expense Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Expense Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !expenseDate && "text-muted-foreground",
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expenseDate
                    ? format(expenseDate, "dd-MM-yyyy")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expenseDate}
                  onSelect={setExpenseDate}
                  initialFocus
                  disabled={(date) => date > new Date() || isSubmitting}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground",
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate
                    ? format(paymentDate, "dd-MM-yyyy")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                  disabled={(date) => date > new Date() || isSubmitting}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Details</label>
            <Textarea
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="Reference number, bank name, transaction ID..."
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose of payment, additional notes..."
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Attachment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Attachment (optional)</label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-[#FAB435] bg-[#FAB435]/5"
                  : "border-border hover:border-[#FAB435]/50",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById("attachment-upload")?.click()
              }
            >
              {uploadedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium truncate max-w-xs">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Paperclip className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-1">
                    PDF, JPG, PNG (max 2MB)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                </>
              )}
              <input
                type="file"
                id="attachment-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileUpload(e.target.files[0])
                }
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t">
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
              className="px-10 bg-[#FAB435] hover:bg-[#e0a027] text-[#1a1a1a] font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Payable"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
