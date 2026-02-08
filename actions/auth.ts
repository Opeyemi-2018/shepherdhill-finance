"use server";

import { cookies } from "next/headers";
import { SignInType } from "@/types/auth";
interface ApiLoginResponse {
  status: boolean;
  data: {
    access_token: {
      name: string;
      abilities: string[];
      expires_at: string | null;
      tokenable_id: number;
      tokenableType: string;
      updated_at: string;
      created_at: string;
      id: number;
    };
    user: {
      id: number;
      name: string;
      email: string;
      type: string;
    };
  };
}

export type SignInResult =
  | {
      success: true;
      data: { token: string; user: ApiLoginResponse["data"]["user"] };
    }
  | { success: false; error: string };

export async function signInAction(
  credentials: SignInType
): Promise<SignInResult> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    if (!res.ok) {
      return { success: false, error: "Invalid email or password" };
    }

    const data = (await res.json()) as ApiLoginResponse;

    if (!data.status) {
      return {
        success: false,
        error: "Login failed. Please check your credentials.",
      };
    }

    const token = data.data.access_token.name;
    const user = data.data.user;

    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return {
      success: true,
      data: {
        token,
        user,
      },
    };
  } catch (error) {
    console.error("signInAction error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}
