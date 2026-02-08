/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { CalendarIcon, Paperclip, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HeaderContent from "@/components/HeaderContent";
import { invoiceSchema, InvoiceFormValues } from "@/types/invoice";
import { useAuth } from "@/context/user";
import { createInvoiceAction } from "@/actions/invoice";
import { useClients } from "@/hooks/useClient";

export default function CreateInvoice() {
  const { token } = useAuth();
  const router = useRouter();

  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
  } = useClients();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<InvoiceFormValues>({
  resolver: zodResolver(invoiceSchema),
  defaultValues: {
    client_id: "",
    amount: "",
    description: "",
  },
});

  const handleSubmit = async (saveAsDraft: boolean) => {
    if (!token) {
      toast.error("You must be logged in to create an invoice");
      router.push("/sign-in");
      return;
    }

    if (saveAsDraft) {
      setIsSavingDraft(true);
    } else {
      setIsCreating(true);
    }

    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Please fill all required fields correctly");
        return;
      }

      const values = form.getValues();

      if (!values.client_id) {
        toast.error("Please select a client");
        return;
      }

      if (!values.invoice_date || !values.due_date) {
        toast.error("Please select invoice and due dates");
        return;
      }

      const payload = {
        amount: Number(values.amount),
        client_id: Number(values.client_id),
        description: values.description || "",
        status: "unpaid",
        invoice_date: format(values.invoice_date, "yyyy-MM-dd"),
        due_date: format(values.due_date, "yyyy-MM-dd"),
        ...(saveAsDraft && { type: "draft" as const }),
      };

      console.log("Sending payload:", payload);

      const result = await createInvoiceAction(payload, token);

      if (!result.success) {
        toast.error(result.error || "Failed to process invoice");
        return;
      }

      toast.success(
        saveAsDraft
          ? "Invoice saved as draft successfully!"
          : "Invoice created successfully!"
      );

      router.push("/invoices");
      form.reset();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit invoice");
    } finally {
      if (saveAsDraft) {
        setIsSavingDraft(false);
      } else {
        setIsCreating(false);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF and JPG files are allowed");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    toast.success("File uploaded successfully");
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
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div>
      <HeaderContent
        title="Invoices"
        description="Fill in the invoice details or upload an invoice file"
      />

      <div className="bg-primary-foreground p-3 md:p-6 mt-4">
        <h1 className="text-[#3A3A3A] dark:text-white text-[16px] md:text-[20px] font-bold mb-3">
          Create Invoice
        </h1>

        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  {clientsLoading ? (
                    <div className="h-12 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading clients...
                    </div>
                  ) : clientsError ? (
                    <div className="h-12 flex items-center text-red-600">
                      {clientsError}
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="h-12 flex items-center text-gray-500">
                      No clients available
                    </div>
                  ) : (
                    <>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#F9FAFB] py-6 border-[#E5E7EB] h-12">
                            <SelectValue placeholder="Select Client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id.toString()}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 bg-[#F9FAFB] border-[#E5E7EB] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSavingDraft || isCreating}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd-MM-yy")
                          ) : (
                            <span>DD-MM-YY</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 bg-[#F9FAFB] border-[#E5E7EB] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSavingDraft || isCreating}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd-MM-yy")
                          ) : (
                            <span>DD-MM-YY</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      className="bg-[#F9FAFB] border-[#E5E7EB] h-12"
                      placeholder="Enter Amount"
                      disabled={isSavingDraft || isCreating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-[#F9FAFB] border-[#E5E7EB] min-h-[100px] resize-none"
                      placeholder="Notes (optional)"
                      disabled={isSavingDraft || isCreating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                className="px-6 bg-[#3A3A3A]/10"
                disabled={isSavingDraft || isCreating || clientsLoading}
                onClick={() => handleSubmit(true)}
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>

              <Button
                type="button"
                className="bg-[#FAB435]/30 hover:bg-[#FF8C00] text-[#FAB435] hover:text-white"
                disabled={isSavingDraft || isCreating || clientsLoading}
                onClick={() => handleSubmit(false)}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 font-medium">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div>
          <h2 className="md:text-[20px] font-bold dark:text-white text-[#3A3A3A] mb-4">
            Upload Invoice
          </h2>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
              isDragging ? "border-[#0A6DC0]" : "border-[#3A3A3A]/25"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              !uploadedFile && document.getElementById("file-upload")?.click()
            }
          >
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <Paperclip className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 font-medium">
                  {uploadedFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">
                  Upload invoice file (PDF, JPG)
                </p>
                <p className="text-sm text-gray-400">
                  Drag and drop or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                />
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="px-6 bg-[#3A3A3A]/10"
              onClick={() => {
                if (uploadedFile) {
                  toast.info("File upload feature coming soon!");
                } else {
                  toast.error("Please upload a file first");
                }
              }}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              className="bg-[#FAB435]/30 hover:bg-[#FF8C00] text-[#FAB435] hover:text-white"
              onClick={() => {
                if (uploadedFile) {
                  toast.info("File upload feature coming soon!");
                } else {
                  toast.error("Please upload a file first");
                }
              }}
            >
              Send Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}