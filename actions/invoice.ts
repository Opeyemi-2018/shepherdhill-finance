/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { InvoicePayload } from "@/types/invoice";

// ────────────────────────────────────────────────
// Types for create invoice response
// ────────────────────────────────────────────────
interface InvoiceResponse {
  id: number;
  amount: number;
  client_id: number;
  description: string;
  status: string;
  invoice_date: string;
  due_date: string;
  type?: string;
  client?: {
    id: number;
    name: string;
    email: string;
  };
  creator?: {
    id: number;
    name: string;
  } | null;
}

export type CreateInvoiceResult =
  | { success: true; data: InvoiceResponse; message?: string }
  | { success: false; error: string };

// ────────────────────────────────────────────────
// Types for list of invoices (/invoice/all)
// ────────────────────────────────────────────────
interface InvoiceSummary {
  total_count: number;
  paid_count: number;
  unpaid_count: number;
  draft_count: number;
}

interface InvoiceListResponse {
  status: boolean;
  summary: InvoiceSummary;
  data: {
    all: InvoiceResponse[];
    paid: InvoiceResponse[];
    unpaid: InvoiceResponse[];
    draft: InvoiceResponse[];
  };
}

export type FetchInvoicesResult =
  | { success: true; data: InvoiceListResponse }
  | { success: false; error: string };

// ────────────────────────────────────────────────
// Types for single invoice detail (/invoice/details/{id})
// ────────────────────────────────────────────────
interface InvoiceDetail {
  id: number;
  amount: string | number;
  client_id: number;
  description: string;
  status: string;
  invoice_date: string;
  due_date: string;
  created_by: number | string;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    user_id: string;
    name: string;
    email: string;
    address?: string;
    location?: string;
    service?: string;
    logo?: string | null;
    staff_number?: string;
    start_date?: string;
    end_date?: string;
    is_active?: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
  };
  creator: {
    id: number;
    name: string;
  } | null;
}

export type SendInvoiceResult =
  | { success: true; message: string }
  | { success: false; error: string };

export type FetchInvoiceDetailResult =
  | { success: true; data: InvoiceDetail; message?: string }
  | { success: false; error: string };

// ────────────────────────────────────────────────
// Create invoice
// ────────────────────────────────────────────────
export async function createInvoiceAction(
  payload: InvoicePayload,
  token: string,
): Promise<CreateInvoiceResult> {
  if (!token) {
    return { success: false, error: "Authentication token is missing." };
  }

  try {
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

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to create invoice";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}
      return { success: false, error: errorMessage };
    }

    const data = await response.json();

    if (!data.status) {
      return {
        success: false,
        error: data.message || "Invoice creation failed",
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message || "Invoice created successfully",
    };
  } catch (error) {
    console.error("createInvoiceAction error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}

// ────────────────────────────────────────────────
// Fetch all invoices (/invoice/all)
// ────────────────────────────────────────────────
export async function fetchInvoices(
  token: string,
): Promise<FetchInvoicesResult> {
  if (!token) {
    return { success: false, error: "No authentication token provided" };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        error: `Failed to fetch invoices: ${res.status}`,
      };
    }

    const data = await res.json();

    if (!data.status) {
      return {
        success: false,
        error: data.message || "Failed to load invoices",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("fetchInvoices error:", error);
    return { success: false, error: "Network error while fetching invoices" };
  }
}

// ────────────────────────────────────────────────
// Fetch single invoice detail by ID (/invoice/details/{id})
// ────────────────────────────────────────────────
export async function fetchInvoiceDetailAction(
  invoiceId: string | number,
  token: string,
): Promise<FetchInvoiceDetailResult> {
  if (!token) {
    return {
      success: false,
      error: "Authentication token is missing. Please log in again.",
    };
  }

  if (!invoiceId) {
    return {
      success: false,
      error: "Invoice ID is required",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/invoice/details/${invoiceId}`,
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
      const errorText = await response.text();
      let errorMessage = `Failed to fetch invoice details (HTTP ${response.status})`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}

      return { success: false, error: errorMessage };
    }

    const json = await response.json();

    if (!json.status || !json.data?.invoice) {
      return {
        success: false,
        error: json.message || "Invalid response from server",
      };
    }

    return {
      success: true,
      data: json.data.invoice,
      message: json.message || "Invoice details loaded successfully",
    };
  } catch (error: any) {
    console.error("fetchInvoiceDetailAction error:", error);
    return {
      success: false,
      error: error.message || "Network error. Please try again later.",
    };
  }
}

export async function sendInvoiceAction(
  invoiceId: string | number,
  token: string,
): Promise<SendInvoiceResult> {
  if (!token) {
    return {
      success: false,
      error: "Authentication token is missing. Please log in again.",
    };
  }

  if (!invoiceId) {
    return {
      success: false,
      error: "Invoice ID is required",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/invoice/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoice_id: invoiceId.toString(), // backend expects string
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to send invoice (HTTP ${response.status})`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}

      return { success: false, error: errorMessage };
    }

    const json = await response.json();

    if (!json.status) {
      return {
        success: false,
        error: json.message || "Failed to send invoice",
      };
    }

    return {
      success: true,
      message: json.message || "Invoice sent successfully",
    };
  } catch (error: any) {
    console.error("sendInvoiceAction error:", error);
    return {
      success: false,
      error: error.message || "Network error. Please try again later.",
    };
  }
}
