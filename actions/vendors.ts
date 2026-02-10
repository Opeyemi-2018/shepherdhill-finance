/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/payables.ts
"use server";

import { revalidatePath } from "next/cache";

interface CreateVendorResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: { id: number; name: string };
}

export async function createVendorAction(
  formData: FormData,
  token: string
): Promise<CreateVendorResult> {
  if (!token) {
    return { success: false, error: "Authentication token is missing." };
  }

  try {
    const name = formData.get("name")?.toString().trim();

    if (!name) {
      return { success: false, error: "Vendor name is required." };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payables/vendor/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      let msg = `Failed to create vendor (${response.status})`;
      try {
        const json = JSON.parse(text);
        msg = json.message || json.errors?.name?.[0] || msg;
      } catch {}
      return { success: false, error: msg };
    }

    const json = await response.json();

    if (!json.status) {
      return {
        success: false,
        error: json.message || "Failed to create vendor",
      };
    }

    revalidatePath("/payables"); // Refresh payables list
    revalidatePath("/record-vendors-payment"); // Refresh record payment page

    return {
      success: true,
      message: json.message || "Vendor created successfully",
      data: json.data,
    };
  } catch (err: any) {
    console.error("createVendorAction error:", err);
    return {
      success: false,
      error: err.message || "Network/server error while creating vendor",
    };
  }
}