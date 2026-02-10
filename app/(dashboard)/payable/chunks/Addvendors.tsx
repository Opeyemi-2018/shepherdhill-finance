/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import { createVendorAction } from "@/actions/vendors";

interface AddVendorModalProps {
  onVendorCreated?: (newVendor: { id: number; name: string }) => void;
  trigger?: React.ReactNode; // optional custom trigger button
}

export function AddVendorModal({ onVendorCreated, trigger }: AddVendorModalProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vendor name is required");
      return;
    }

    if (!token) {
      toast.error("Please sign in to create vendor");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());

      const result = await createVendorAction(formData, token);

      if (!result.success) {
        toast.error(result.error || "Failed to create vendor");
        return;
      }

      toast.success(result.message || "Vendor created successfully!");

      if (onVendorCreated && result.data) {
        onVendorCreated(result.data);
      }

      setOpen(false);
      setName(""); // reset form
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-[#FAB435]/30 text-[#E89500]">
            Add Vendor
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Vendor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Vendor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter vendor name"
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-[#FAB435] hover:bg-[#e0a027] text-[#1a1a1a]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Vendor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}