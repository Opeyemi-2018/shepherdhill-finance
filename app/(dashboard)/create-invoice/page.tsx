/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
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
import { CalendarIcon, Loader2, Plus, Trash2, Hash } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { useAuth } from "@/context/user";
import { createInvoiceAction } from "@/actions/invoice";
import { useClients } from "@/hooks/useClient";
import { z } from "zod";

// ─── Schema ────────────────────────────────────────────────────────────────────
const lineItemSchema = z.object({
  service: z.string().min(1, "Service is required"),
  quantity: z.coerce.number().min(1, "Min 1"),
  rate: z.coerce.number().min(0, "Min 0"),
});

const invoiceSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  invoice_date: z.date({ required_error: "Invoice date is required" }),
  due_date: z.date({ required_error: "Due date is required" }),
  items: z.array(lineItemSchema).min(1, "Add at least one line item"),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  terms: z.string().optional(),
  payment_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  signature: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function generateInvoiceNumber(): string {
  const prefix = "INV";
  const timestamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${timestamp}-${rand}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function CreateInvoice() {
  const { token } = useAuth();
  const router = useRouter();
  const { clients, isLoading: clientsLoading, error: clientsError } = useClients();

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [invoiceNumber] = useState(generateInvoiceNumber);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: "",
      items: [{ service: "", quantity: 1, rate: 0 }],
      discount: 0,
      tax: 0,
      terms: "",
      payment_link: "",
      signature: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // ─── Watch items for live calculation ────────────────────────────────────────
  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount") || 0;
  const watchedTax = form.watch("tax") || 0;

  const lineSubtotals = watchedItems.map(
    (item) => (Number(item.quantity) || 0) * (Number(item.rate) || 0)
  );
  const subtotal = lineSubtotals.reduce((a, b) => a + b, 0);
  const discountAmount = Number(watchedDiscount) || 0;
  const taxAmount = Number(watchedTax) || 0;
  const total = subtotal - discountAmount + taxAmount;

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (saveAsDraft: boolean) => {
    if (!token) {
      toast.error("You must be logged in to create an invoice");
      router.push("/sign-in");
      return;
    }

    saveAsDraft ? setIsSavingDraft(true) : setIsCreating(true);

    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Please fix the errors before submitting");
        return;
      }

      const values = form.getValues();

      const payload = {
        invoice_number: invoiceNumber,
        client_id: Number(values.client_id),
        invoice_date: format(values.invoice_date, "yyyy-MM-dd"),
        due_date: format(values.due_date, "yyyy-MM-dd"),
        items: values.items.map((item) => ({
          service: item.service,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          subtotal: Number(item.quantity) * Number(item.rate),
        })),
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        amount: total, // final total sent as `amount`
        status: "unpaid" as const,
        terms: values.terms || "",
        payment_link: values.payment_link || "",
        signature: values.signature || "",
        ...(saveAsDraft && { type: "draft" as const }),
      };

      const result = await createInvoiceAction(payload, token);

      if (!result.success) {
        toast.error(result.error || "Failed to process invoice");
        return;
      }

      toast.success(
        saveAsDraft ? "Invoice saved as draft!" : "Invoice created successfully!"
      );
      router.push("/invoices");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit invoice");
    } finally {
      saveAsDraft ? setIsSavingDraft(false) : setIsCreating(false);
    }
  };

  const isSubmitting = isSavingDraft || isCreating;

  return (
    <div>
      <HeaderContent
        title="Invoices"
        description="Fill in the invoice details below to create or send a quote to your client."
      />

      <div className="bg-primary-foreground p-3 md:p-6 mt-4">
        {/* Header row: title + invoice number */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-[#3A3A3A] dark:text-white text-[16px] md:text-[20px] font-bold">
            Create Invoice
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAB435]/10 border border-[#FAB435]/30">
            <Hash className="w-3.5 h-3.5 text-[#FAB435]" />
            <span className="text-[13px] font-semibold text-[#FAB435] tracking-wide">
              {invoiceNumber}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-6">

            {/* ── Client + Dates (row) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    {clientsLoading ? (
                      <div className="h-12 flex items-center gap-2 text-[13px] text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                      </div>
                    ) : clientsError ? (
                      <div className="h-12 flex items-center text-red-500 text-[13px]">{clientsError}</div>
                    ) : (
                      <>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="bg-[#F9FAFB] border-[#E5E7EB] h-12">
                              <SelectValue placeholder="Select Client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
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

              {/* Invoice Date */}
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
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd-MM-yy") : <span>DD-MM-YY</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
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
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd-MM-yy") : <span>DD-MM-YY</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Line Items Table ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-[14px] font-semibold">Services / Items</FormLabel>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 text-[12px] h-8"
                  onClick={() => append({ service: "", quantity: 1, rate: 0 })}
                  disabled={isSubmitting}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </Button>
              </div>

              {/* Table header */}
              <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] bg-gray-50 dark:bg-gray-800 px-4 py-2 text-[12px] font-semibold text-gray-500 dark:text-[#979797] uppercase tracking-wide">
                  <span>Service</span>
                  <span>Qty</span>
                  <span>Rate (₦)</span>
                  <span>Subtotal</span>
                  <span />
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-3 border-t border-[#E5E7EB] first:border-t-0"
                  >
                    {/* Service */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.service`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Man Guarding"
                              className="h-9 text-[13px] bg-[#F9FAFB] border-[#E5E7EB]"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              placeholder="1"
                              className="h-9 text-[13px] bg-[#F9FAFB] border-[#E5E7EB]"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Rate */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.rate`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              className="h-9 text-[13px] bg-[#F9FAFB] border-[#E5E7EB]"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Subtotal (read-only) */}
                    <div className="h-9 flex items-center px-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-[#E5E7EB] text-[13px] font-medium text-[#3A3A3A] dark:text-white">
                      {formatCurrency(lineSubtotals[index] || 0)}
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length === 1 || isSubmitting}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals panel */}
              <div className="mt-3 flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-[13px]">
                  <div className="flex justify-between text-gray-500 dark:text-[#979797]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#3A3A3A] dark:text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500 dark:text-[#979797] shrink-0">Discount (₦)</span>
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem className="space-y-0 w-32">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              className="h-8 text-[13px] text-right bg-[#F9FAFB] border-[#E5E7EB]"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tax */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500 dark:text-[#979797] shrink-0">Tax (₦)</span>
                    <FormField
                      control={form.control}
                      name="tax"
                      render={({ field }) => (
                        <FormItem className="space-y-0 w-32">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              className="h-8 text-[13px] text-right bg-[#F9FAFB] border-[#E5E7EB]"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t border-[#E5E7EB] pt-2 flex justify-between font-bold text-[14px] text-[#3A3A3A] dark:text-white">
                    <span>Total</span>
                    <span className="text-[#FAB435]">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Terms & Conditions ── */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g. Payment due within 30 days. Late payments attract a 5% surcharge..."
                      className="bg-[#F9FAFB] border-[#E5E7EB] min-h-[100px] resize-none text-[13px]"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Payment Link + Signature (row) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Link <span className="text-[11px] text-gray-400 font-normal ml-1">(optional)</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://paystack.com/pay/..."
                        className="bg-[#F9FAFB] border-[#E5E7EB] h-12 text-[13px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authorized Signature <span className="text-[11px] text-gray-400 font-normal ml-1">(optional)</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Full name or designation"
                        className="bg-[#F9FAFB] border-[#E5E7EB] h-12 text-[13px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="px-6 bg-[#3A3A3A]/10"
                disabled={isSubmitting || clientsLoading}
                onClick={() => handleSubmit(true)}
              >
                {isSavingDraft ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  "Save as Draft"
                )}
              </Button>

              <Button
                type="button"
                className="bg-[#FAB435]/30 hover:bg-[#FF8C00] text-[#FAB435] hover:text-white"
                disabled={isSubmitting || clientsLoading}
                onClick={() => handleSubmit(false)}
              >
                {isCreating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
                ) : (
                  "Create Invoice"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}