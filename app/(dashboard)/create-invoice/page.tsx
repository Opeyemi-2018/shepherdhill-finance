/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HeaderContent from "@/components/HeaderContent";

const clients = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Acme Corp" },
  { id: "4", name: "Tech Solutions Ltd" },
];

const invoiceSchema = z.object({
  client: z.string().min(1, "Please select a client"),
  invoiceId: z.string().min(1, "Invoice ID is required"),
  invoiceDate: z.date({
    message: "Invoice date is required",
  }),
  dueDate: z.date({
    message: "Due date is required",
  }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be a valid positive number",
    ),
  description: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const CreateInvoice = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client: "",
      invoiceId: `IV-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: "",
      description: "",
    },
  });

  const onSubmit = (data: InvoiceFormValues, isDraft: boolean = false) => {
    console.log("Form Data:", data);
    console.log("Is Draft:", isDraft);
    console.log("Uploaded File:", uploadedFile);

    if (isDraft) {
      toast.success("Invoice saved as draft!");
    } else {
      toast.success("Invoice sent successfully!");
    }

    // Reset form after submission
    form.reset({
      client: "",
      invoiceId: `IV-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: "",
      description: "",
    });
    setUploadedFile(null);
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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="">
      <HeaderContent
        title="Invoices"
        description="Fill in the invoice details or upload an invoice file"
      />

      <div className="bg-primary-foreground p-3 md:p-6 mt-4">
        <h1 className="text-[#3A3A3A] dark:text-white text-[16px] md:text-[20] font-bold mb-3">
          Create Invoice
        </h1>
        <Form {...form}>
          <form className="space-y-6">
            {/* Client Selection */}
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] dark:text-white font-dm-sans font-medium">
                    Client
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger className="bg-[#F9FAFB] py-6 border-[#E5E7EB] h-12">
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] dark:text-white font-dm-sans font-medium">
                    Invoice Id
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-[#F9FAFB] border-[#E5E7EB] h-12"
                      placeholder="IV-1025"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] dark:text-white font-dm-sans font-medium">
                    Invoice Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 bg-[#F9FAFB] border-[#E5E7EB] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] dark:text-white font-dm-sans font-medium">
                    Due Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 bg-[#F9FAFB] border-[#E5E7EB] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
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
                  <FormLabel className="text-[#2F2F2F] dark:text-white font-dm-sans font-medium">
                    Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="bg-[#F9FAFB] border-[#E5E7EB] h-12"
                      placeholder="Enter Amount"
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
                  <FormLabel className="text-[#2F2F2F] dark:text-white font-dm-sans font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-[#F9FAFB] border-[#E5E7EB] min-h-[100px] resize-none"
                      placeholder="Notes (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="px-6 bg-[#3A3A3A]/10"
                onClick={() =>
                  form.handleSubmit((data) => onSubmit(data, true))()
                }
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                className="bg-[#FAB435]/30 hover:bg-[#FF8C00] text-[#FAB435] hover:text-white"
                onClick={() =>
                  form.handleSubmit((data) => onSubmit(data, false))()
                }
              >
                Send Invoice
              </Button>
            </div>
          </form>
        </Form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 font-medium">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Upload Invoice Section */}
        <div className="">
          <h2 className="md:text-[20px] font-bold dark:text-white  text-[#3A3A3A] mb-4">
            Upload Invoice
          </h2>

          {/* File Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
              isDragging ? "border-[#0A6DC0]" : "border-[#3A3A3A]/25",
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

          {/* Action Buttons for Upload */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="px-6 bg-[#3A3A3A]/10"
              onClick={() => {
                if (uploadedFile) {
                  toast.success("Invoice saved as draft!");
                  setUploadedFile(null);
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
                  toast.success("Invoice sent successfully!");
                  setUploadedFile(null);
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
};

export default CreateInvoice;
