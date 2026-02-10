'use server'
import { revalidatePath } from "next/cache";

/* eslint-disable @typescript-eslint/no-explicit-any */

// for receiviable
export interface RecordPaymentResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export async function recordPaymentAction(
  formData: FormData,
  token: string,
): Promise<RecordPaymentResult> {
  if (!token) {
    return { success: false, error: "Authentication token is missing." };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/receivable/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Do NOT set Content-Type — browser handles multipart/form-data
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      let msg = `Failed (${response.status})`;
      try {
        const json = JSON.parse(text);
        msg = json.message || msg;
      } catch {}
      return { success: false, error: msg };
    }

    const json = await response.json();

    if (!json.status) {
      return {
        success: false,
        error: json.message || "Payment recording failed",
      };
    }

    return {
      success: true,
      message: json.message || "Payment recorded successfully",
      data: json.data,
    };
  } catch (err: any) {
    console.error("recordPaymentAction:", err);
    return {
      success: false,
      error: err.message || "Network or server error",
    };
  }
}

// for payable

interface CreatePayableResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export async function createPayableAction(
  formData: FormData,
  token: string,
): Promise<CreatePayableResult> {
  if (!token) {
    return { success: false, error: "Authentication token is missing." };
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/payables/create`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = `Failed to create payable (${response.status})`;
      try {
        const json = JSON.parse(text);
        msg =
          json.message ||
          json.errors?.[Object.keys(json.errors)[0]]?.[0] ||
          msg;
      } catch {}
      return { success: false, error: msg };
    }

    const json = await response.json();

    if (!json.status) {
      return {
        success: false,
        error: json.message || "Failed to create payable",
      };
    }

    revalidatePath("/payables"); // or wherever your payables list is

    return {
      success: true,
      message: json.message || "Payable created successfully",
      data: json.data,
    };
  } catch (err: any) {
    console.error("createPayableAction error:", err);
    return {
      success: false,
      error: err.message || "Network/server error while creating payable",
    };
  }
}
