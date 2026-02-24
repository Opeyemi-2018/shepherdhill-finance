/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/user"; // adjust path if needed
import { toast } from "sonner"; // recommended — replace with alert if not using sonner

export default function PasswordSettingsTab() {
  const { token } = useAuth();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSave = async () => {
    setFieldErrors({});

    if (!form.current.trim()) {
      toast.error("Current password is required");
      return;
    }
    if (!form.new.trim()) {
      toast.error("New password is required");
      return;
    }
    if (form.new !== form.confirm) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (!token) {
      toast.error("You must be logged in to change password");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        current_password: form.current,
        new_password: form.new,
        new_password_confirmation: form.confirm,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_CLIENT_URL}/password/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.status) {
        if (result.errors) {
          const newErrors: Record<string, string> = {};

          Object.entries(result.errors).forEach(([key, value]) => {
            if (
              Array.isArray(value) &&
              value.length > 0 &&
              typeof value[0] === "string"
            ) {
              newErrors[key] = value[0];
            }
          });

          setFieldErrors(newErrors);

          const firstError = Object.values(newErrors)[0];
          if (firstError) {
            toast.error(firstError);
          } else if (result.message) {
            toast.error(result.message);
          } else {
            toast.error("Failed to update password");
          }
          return;
        }

        throw new Error(result.message || `Failed (${response.status})`);
      }

      toast.success("Password updated successfully!");
      setForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      console.error("Password update error:", err);
      toast.error(
        err.message || "Failed to update password. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ current: "", new: "", confirm: "" });
    setFieldErrors({});
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#3A3A3A] dark:text-white">
        Reset Password
      </h2>

      <div className="space-y-6 max-w-md">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#3A3A3A] dark:text-gray-300">
            Current Password
          </label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              name="current"
              value={form.current}
              onChange={handleChange}
              placeholder="Enter current password"
              className="bg-[#F9FAFB] dark:bg-gray-900 border-[#E5E7EB] dark:border-gray-700 h-12 rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#3A3A3A] dark:text-gray-300">
            New Password
          </label>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              name="new"
              value={form.new}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`bg-[#F9FAFB] dark:bg-gray-900 border h-12 rounded-lg pr-10 ${
                fieldErrors.new_password || fieldErrors.new
                  ? "border-red-500 focus:ring-red-500"
                  : "border-[#E5E7EB] dark:border-gray-700"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.new_password && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {fieldErrors.new_password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#3A3A3A] dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="bg-[#F9FAFB] dark:bg-gray-900 border-[#E5E7EB] dark:border-gray-700 h-12 rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>

          <Button
            className="px-8 bg-[#FAB435]/30 hover:bg-[#FAB435]/50 text-[#E89500] dark:text-[#FAB435]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
