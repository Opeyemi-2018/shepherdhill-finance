"use client";

import { useAuth } from "@/context/user";
import { useEffect, useRef, useCallback } from "react";

export const useSessionGuard = () => {
  const { token, handleAuthError } = useAuth();
  const isChecking = useRef(false);

  const checkSession = useCallback(async () => {
    if (!token) return;
    if (isChecking.current) return;
    
    isChecking.current = true;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const json = await res.json();

      // Check for auth failure in MULTIPLE response formats
      const isAuthFailure = 
        // Format 1: { status: false, message: "Invalid bearer..." }
        (json.status === false && json.message?.toLowerCase().includes("invalid")) ||
        // Format 2: { success: false, error: "..." }
        (json.success === false && json.error?.toLowerCase().includes("401")) ||
        // Format 3: Any error mentioning token/auth/401
        (json.error && (
          json.error.toLowerCase().includes("unauthorized") ||
          json.error.toLowerCase().includes("unauthenticated") ||
          json.error.toLowerCase().includes("401")
        )) ||
        // Format 4: HTTP status 401
        res.status === 401;

      if (isAuthFailure) {
        console.log("Token invalidated - redirecting to login");
        handleAuthError();
        return;
      }
    } catch (error) {
      // Network error - don't redirect
      console.debug("Session check failed:", error);
    } finally {
      isChecking.current = false;
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    if (!token) return;

    // Check immediately on mount
    checkSession();

    // Set up periodic check (every 30 seconds)
    const interval = setInterval(checkSession, 30000);

    // Check when window gets focus
    window.addEventListener("focus", checkSession);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkSession);
    };
  }, [token, checkSession]);
};