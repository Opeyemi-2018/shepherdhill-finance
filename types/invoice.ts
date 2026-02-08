// types/invoice.ts
import { z } from "zod";

export const invoiceSchema = z
  .object({
    client_id: z.string().min(1, "Please select a client"),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        "Amount must be a valid positive number"
      ),
    invoice_date: z.date({
      message: "Invoice date is required",
    }),
    due_date: z.date({
      message: "Due date is required",
    }),
    description: z.string().optional(),
    // Remove status from schema - we'll add it in the payload
  })
  .refine((data) => data.due_date >= data.invoice_date, {
    message: "Due date must be after invoice date",
    path: ["due_date"],
  });

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export interface InvoicePayload {
  type?: "draft" | null;
  amount: number;
  client_id: number;
  description?: string;
  status: string;
  invoice_date: string;
  due_date: string;
}