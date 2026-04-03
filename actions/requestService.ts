"use server";
import { revalidatePath } from "next/cache";

export async function getServiceRequests(token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/requests`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || "Failed to fetch service requests",
        error: errData,
      };
    }

    const json = await res.json();

    return {
      success: true,
      data: json?.data?.data ?? [],
      pagination: json?.data || {},
    };
  } catch (error) {
    console.error("Get service requests error:", error);
    return {
      success: false,
      message: "Server error while fetching service requests",
    };
  }
}

export async function getServiceDetails(
  token: string,
  serviceId: string | number,
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/details/${serviceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || "Failed to fetch service details",
        error: errData,
      };
    }

    const json = await res.json();

    if (!json.status || !json.data) {
      return {
        success: false,
        message: json.message || "Invalid service details response",
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (error) {
    console.error("Get service details error:", error);
    return {
      success: false,
      message: "Server error while fetching service details",
    };
  }
}

export async function addServiceAmount(
  token: string,
  payload: { service_id: string | number; amount: string | number },
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/amount`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || "Failed to add amount to service",
        error: errData,
      };
    }

    const json = await res.json();

    // Assuming your API returns { status: true, message: "...", data?: {...} }
    if (!json.status) {
      return {
        success: false,
        message: json.message || "Amount update failed",
      };
    }

    // Optional: revalidate the service details page
    revalidatePath(`/dashboard/services/${payload.service_id}`);

    return {
      success: true,
      message: json.message || "Amount added successfully",
      data: json.data ?? null,
    };
  } catch (error) {
    console.error("Add service amount error:", error);
    return {
      success: false,
      message: "Server error while adding amount",
    };
  }
}

export async function deployStaffToService(
  token: string,
  payload: {
    employee_id: string;
    service_id: string | number;
    client_id: string | number;
    hours: string;
    validity_period: string;
    resumption_time: string; 
  },
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service/deploy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || "Failed to deploy staff",
        error: errData,
      };
    }

    const json = await res.json();

    if (!json.status) {
      return {
        success: false,
        message: json.message || "Deployment failed",
      };
    }

    // Revalidate the service detail page to show updated deployment status
    revalidatePath(`/dashboard/services/${payload.service_id}`);

    return {
      success: true,
      message: json.message || "Staff deployed successfully",
      data: json.data ?? null,
    };
  } catch (error) {
    console.error("Deploy staff error:", error);
    return {
      success: false,
      message: "Server error during staff deployment",
    };
  }
}
