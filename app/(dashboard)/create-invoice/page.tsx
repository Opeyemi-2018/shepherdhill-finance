/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import HeaderContent from "@/components/HeaderContent";
import { useClients } from "@/hooks/useClient";
import { useAuth } from "@/context/user";
import { useServices } from "@/hooks/useService";

import { Switch } from "@/components/ui/switch";

// ─── Types ────────────────────────────────────────────────────────────────
interface LineItem {
  service_id: string;
  service_name: string;
  quantity: number;
  rate: number;
}

interface FormData {
  client_id: string;
  invoice_date: Date;
  due_date: string;
  items: LineItem[];
  discount: number;
  tax: number;
  terms: string;
  payment_link: string;
  type: "draft" | null;
  status: "paid" | "unpaid"; // Add this
}

interface FormErrors {
  client_id?: string;
  invoice_date?: string;
  due_date?: string;
  items?: string;
  discount?: string;
  tax?: string;
  payment_link?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
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

function validateUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function CreateInvoice() {
  const router = useRouter();
  const { token } = useAuth();
  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
  } = useClients();
  const { services, isLoading: servicesLoading } = useServices();

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [invoiceNumber] = useState(generateInvoiceNumber);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    client_id: "",
    invoice_date: new Date(),
    due_date: format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd",
    ),
    items: [{ service_id: "", service_name: "", quantity: 1, rate: 0 }],
    discount: 0,
    tax: 0,
    terms: "",
    payment_link: "",
    type: null,
    status: "unpaid", // Add this
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Handle service selection
  const handleServiceSelect = (index: number, serviceId: string) => {
    const selectedService = services.find((s) => s.id.toString() === serviceId);
    if (selectedService) {
      const updatedItems = [...formData.items];
      updatedItems[index] = {
        service_id: serviceId,
        service_name: selectedService.name,
        quantity: 1,
        rate: parseFloat(selectedService.rate.toString()),
      };
      updateFormData("items", updatedItems);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.client_id) {
      newErrors.client_id = "Client is required";
    }

    if (!formData.invoice_date) {
      newErrors.invoice_date = "Invoice date is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = "Add at least one line item";
    } else {
      let hasEmptyService = false;
      for (let i = 0; i < formData.items.length; i++) {
        if (!formData.items[i].service_id) {
          hasEmptyService = true;
          break;
        }
      }
      if (hasEmptyService) {
        newErrors.items = "All services are required";
      }
    }

    if (formData.discount < 0) {
      newErrors.discount = "Discount cannot be negative";
    }

    if (formData.tax < 0) {
      newErrors.tax = "Tax cannot be negative";
    }

    if (formData.payment_link && !validateUrl(formData.payment_link)) {
      newErrors.payment_link = "Must be a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Update line item quantity
  const updateLineItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = quantity;
    updateFormData("items", updatedItems);
  };

  // Add line item
  const addLineItem = () => {
    updateFormData("items", [
      ...formData.items,
      { service_id: "", service_name: "", quantity: 1, rate: 0 },
    ]);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      updateFormData("items", updatedItems);
    }
  };

  // Calculate totals
  const lineSubtotals = formData.items.map(
    (item) => (Number(item?.quantity) || 0) * (Number(item?.rate) || 0),
  );
  const subtotal = lineSubtotals.reduce((a, b) => a + b, 0);
  const discountAmount = formData.discount || 0;
  const taxAmount = formData.tax || 0;
  const total = subtotal - discountAmount + taxAmount;

  const handleSubmit = async (saveAsDraft: boolean) => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    saveAsDraft ? setIsSavingDraft(true) : setIsCreating(true);

    try {
      // Prepare items array - send only service ID and quantity
      const items = formData.items.map((item) => ({
        service: item.service_id,
        quantity: item.quantity,
      }));

      // Build payload according to API requirements
      const payload: any = {
        client_id: parseInt(formData.client_id),
        invoice_date: format(formData.invoice_date, "yyyy-MM-dd"),
        due_date: formData.due_date,
        items: items,
        status: formData.status,
        draft: saveAsDraft,
      };

      payload.draft = saveAsDraft;

      // Add optional fields only if they have values
      if (formData.terms) {
        payload.terms = formData.terms;
      }

      if (formData.payment_link) {
        payload.payment_link = formData.payment_link;
      }

      // Add tax and discount as strings (API expects strings)
      if (
        formData.tax !== undefined &&
        formData.tax !== null &&
        formData.tax !== 0
      ) {
        payload.tax = formData.tax.toString();
      } else {
        payload.tax = "";
      }

      if (
        formData.discount !== undefined &&
        formData.discount !== null &&
        formData.discount !== 0
      ) {
        payload.discount = formData.discount.toString();
      } else {
        payload.discount = "";
      }

      console.log("Sending payload:", payload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoice/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.status) {
        toast.success(
          saveAsDraft
            ? "Invoice saved as draft!"
            : "Invoice created successfully!",
        );
        router.push("/invoices");
      } else {
        // Display detailed validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          toast.error(errorMessages || "Failed to create invoice");
        } else {
          toast.error(data.message || "Failed to create invoice");
        }
      }
    } catch (error: any) {
      console.error("Invoice creation error:", error);
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
        {/* Header */}
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

        <div className="space-y-6">
          {/* Client + Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                Client <span className="text-red-500">*</span>
              </Label>
              {clientsLoading ? (
                <div className="h-12 flex items-center gap-2 text-[13px] text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : clientsError ? (
                <div className="h-12 flex items-center text-red-500 text-[13px]">
                  {clientsError}
                </div>
              ) : (
                <div>
                  <Select
                    value={formData.client_id}
                    onValueChange={(val) => updateFormData("client_id", val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      className={cn(
                        "bg-[#F9FAFB] border-[#E5E7EB] h-12",
                        errors.client_id && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.client_id}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <Label>
                Invoice Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 bg-[#F9FAFB] border-[#E5E7EB] justify-start text-left font-normal",
                      errors.invoice_date && "border-red-500",
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.invoice_date ? (
                      format(formData.invoice_date, "dd-MM-yyyy")
                    ) : (
                      <span>DD-MM-YYYY</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.invoice_date}
                    onSelect={(date) =>
                      date && updateFormData("invoice_date", date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.invoice_date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.invoice_date}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => updateFormData("due_date", e.target.value)}
                className={cn(
                  "h-12 bg-[#F9FAFB] border-[#E5E7EB]",
                  errors.due_date && "border-red-500",
                )}
                disabled={isSubmitting}
              />
              {errors.due_date && (
                <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[14px] font-semibold">
                Services / Items <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1 text-[12px] h-8"
                onClick={addLineItem}
                disabled={isSubmitting}
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </Button>
            </div>

            <div
              className={cn(
                "rounded-lg border border-[#E5E7EB] overflow-hidden",
                errors.items && "border-red-500",
              )}
            >
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto]  px-4 py-2 text-[12px] font-semibold text-gray-500 dark:text-[#979797] uppercase tracking-wide">
                <span>Service</span>
                <span>Qty</span>
                <span>Rate (₦)</span>
                <span>Subtotal</span>
                <span />
              </div>

              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-3 border-t border-[#E5E7EB] first:border-t-0"
                >
                  <Select
                    value={item.service_id}
                    onValueChange={(val) => handleServiceSelect(index, val)}
                    disabled={isSubmitting || servicesLoading}
                  >
                    <SelectTrigger className="h-9 text-[13px] w-full bg-[#F9FAFB] border-[#E5E7EB]">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem
                          key={service.id}
                          value={service.id.toString()}
                        >
                          {service.name} - {formatCurrency(service.rate)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItemQuantity(index, Number(e.target.value) || 0)
                    }
                    className="h-9 text-[13px] bg-[#F9FAFB] border-[#E5E7EB]"
                    disabled={isSubmitting}
                  />

                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.rate}
                    readOnly
                    className="h-9 text-[13px] bg-gray-100 border-[#E5E7EB] cursor-not-allowed"
                    disabled
                  />

                  <div className="h-9 flex items-center px-3 rounded-md  border border-[#E5E7EB] text-[13px] font-medium">
                    {formatCurrency(lineSubtotals[index] || 0)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={formData.items.length === 1 || isSubmitting}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.items && (
              <p className="text-red-500 text-xs mt-1">{errors.items}</p>
            )}

            {/* Totals */}
            <div className="mt-3 flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-[13px]">
                <div className="flex justify-between  text-gray-500 dark:text-[#979797]">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-3">
                  <span className=" text-gray-500 dark:text-[#979797]">
                    Discount (₦) (optional)
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={formData.discount}
                    onChange={(e) =>
                      updateFormData("discount", Number(e.target.value) || 0)
                    }
                    className="w-32 h-8 text-right"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <span className=" text-gray-500 dark:text-[#979797]">
                    Tax (₦) (optional)
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={formData.tax}
                    onChange={(e) =>
                      updateFormData("tax", Number(e.target.value) || 0)
                    }
                    className="w-32 h-8 text-right"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="border-t pt-2 flex justify-between font-bold text-[14px]">
                  <span>Total</span>
                  <span className="text-[#FAB435]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-[14px] font-semibold">
                Invoice Status
              </Label>
              <p className="text-[12px] text-gray-500">
                Mark this invoice as paid or unpaid
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[13px] ${formData.status === "unpaid" ? "text-red-500 font-medium" : "text-gray-400"}`}
              >
                Unpaid
              </span>
              <Switch
                checked={formData.status === "paid"}
                onCheckedChange={(checked) =>
                  updateFormData("status", checked ? "paid" : "unpaid")
                }
                disabled={isSubmitting}
                className="data-[state=checked]:bg-green-500"
              />
              <span
                className={`text-[13px] ${formData.status === "paid" ? "text-green-500 font-medium" : "text-gray-400"}`}
              >
                Paid
              </span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea
              value={formData.terms}
              onChange={(e) => updateFormData("terms", e.target.value)}
              placeholder="e.g. Payment due within 30 days..."
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Link (Optional) */}
          <div className="space-y-2">
            <Label>Payment Link (Optional)</Label>
            <Input
              type="url"
              value={formData.payment_link}
              onChange={(e) => updateFormData("payment_link", e.target.value)}
              placeholder="https://example.com/pay"
              className={cn(errors.payment_link && "border-red-500")}
              disabled={isSubmitting}
            />
            {errors.payment_link && (
              <p className="text-red-500 text-xs mt-1">{errors.payment_link}</p>
            )}
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
            >
              {isSavingDraft ? "Saving Draft..." : "Save as Draft"}
            </Button>

            <Button
              type="button"
              className="bg-[#FAB435] hover:bg-[#E89500] text-black"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
            >
              {isCreating ? "Creating Invoice..." : "Create Invoice"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
