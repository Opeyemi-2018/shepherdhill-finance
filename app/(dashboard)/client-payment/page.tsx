/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
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
import { recordPaymentAction } from "@/actions/payments";
import { useClients } from "@/hooks/useClient";
import { useInvoices } from "@/hooks/useInvoice";

export default function RecordPaymentPage() {
  const router = useRouter();
  const { token } = useAuth();

  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
  } = useClients();

  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
  } = useInvoices();

  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter invoices based on selected client
  const filteredInvoices = useMemo(() => {
    if (!selectedClientId) return invoices;

    return invoices.filter((inv) => {
      // Check if invoice has client_id property
      if (inv.client_id) {
        return inv.client_id.toString() === selectedClientId;
      }
      if (inv.client?.id) {
        return inv.client.id.toString() === selectedClientId;
      }
      return false;
    });
  }, [invoices, selectedClientId]);

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
    toast.success("Receipt attached successfully");
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

    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    if (!selectedInvoiceId) {
      toast.error("Please select an invoice");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!token) {
      toast.error("Please sign in to record payment");
      router.push("/sign-in");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("client_id", selectedClientId);
      formData.append("invoice_id", selectedInvoiceId);
      formData.append("amount", amount);
      formData.append("payment_method", paymentMethod);
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (paymentDate) {
        formData.append("payment_date", format(paymentDate, "yyyy-MM-dd"));
      }
      if (uploadedFile) {
        formData.append("attachment", uploadedFile);
      }

      const result = await recordPaymentAction(formData, token);

      if (!result.success) {
        toast.error(result.error || "Failed to record payment");
        return;
      }

      toast.success(result.message || "Payment recorded successfully!");
      router.push("/receiviable");
    } catch (err: any) {
      console.error("Payment recording error:", err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = clientsLoading || invoicesLoading;

  return (
    <div className="pb-12">
      <HeaderContent
        title="Record Client Payment"
        description="Record Client Payment"
      />

      <div className="mt-6 bg-primary-foreground rounded-xl shadow-lg p-6 md:p-8">
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#FAB435]" />
            <p className="text-muted-foreground">
              Loading clients & invoices...
            </p>
          </div>
        ) : clientsError || invoicesError ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 text-center px-4">
            <div className="text-red-600 text-xl font-medium">
              Error loading data
            </div>
            <p className="text-muted-foreground max-w-md">
              {clientsError ||
                invoicesError ||
                "Failed to load required information"}
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Client <span className="text-red-500">*</span>
              </label>
              {clients.length === 0 ? (
                <div className="h-12 flex items-center px-4 border rounded-md bg-muted/30 text-muted-foreground">
                  No clients available
                </div>
              ) : (
                <Select
                  value={selectedClientId}
                  onValueChange={(val) => {
                    setSelectedClientId(val);
                    setSelectedInvoiceId(""); // reset invoice when client changes
                  }}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                        {client.email && ` (${client.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Invoice Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Invoice <span className="text-red-500">*</span>
              </label>
              {!selectedClientId ? (
                <div className="h-12 flex items-center px-4 border rounded-md bg-[#545454] text-white text-sm">
                  Please select a client first
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="h-12 flex items-center px-4 border rounded-md bg-yellow-50 text-yellow-800 text-sm">
                  No invoices found for this client.
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-2 text-yellow-800 underline"
                    onClick={() => router.push("/create-invoice")}
                  >
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedInvoiceId}
                  onValueChange={setSelectedInvoiceId}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id.toString()}>
                        INV-{inv.id.toString().padStart(4, "0")} • ₦
                        {Number(
                          inv.amount || inv.total_amount || 0,
                        ).toLocaleString()}{" "}
                        • {inv.status?.toUpperCase() || "PENDING"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Amount Paid <span className="text-red-500">*</span>
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

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="pos">POS / Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Notes / Reference */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes / Reference</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Transaction reference, bank name, additional notes..."
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Upload Receipt / Proof (optional)
              </label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 md:p-10 text-center transition-all cursor-pointer",
                  isDragging
                    ? "border-[#FAB435] bg-[#FAB435]/5"
                    : "border-border hover:border-[#FAB435]/40 hover:bg-muted/30",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  !isSubmitting &&
                  document.getElementById("receipt-upload")?.click()
                }
              >
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-6 w-6 text-muted-foreground" />
                      <span className="font-medium text-foreground truncate max-w-[300px]">
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
                      Remove file
                    </Button>
                  </div>
                ) : (
                  <>
                    <Paperclip className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-1 font-medium">
                      PDF, JPG, PNG (max 2MB)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                  </>
                )}
                <input
                  type="file"
                  id="receipt-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      handleFileUpload(e.target.files[0]);
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
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
                disabled={
                  isSubmitting ||
                  !selectedClientId ||
                  !selectedInvoiceId ||
                  clients.length === 0
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
