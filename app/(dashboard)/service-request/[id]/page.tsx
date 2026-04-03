/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoChevronBackOutline } from "react-icons/io5";
import { Loader2, UploadCloud, CheckCircle2, XCircle, Eye, PlusCircle, Shield, Building, Users, Clock, Calendar, DollarSign, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FaUserLarge } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HeaderContent from "@/components/HeaderContent";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ─── Types ─────────────────────────────────────────────────────────────
type PaymentStatus = "pending" | "approved" | "rejected";

// ─── Dummy Data ─────────────────────────────────────────────────────────────
const dummyService = {
  id: 9001,
  service_name: "Armed Escort",
  start_date: "2026-04-01",
  end_date: "2027-04-01",
  next_payment_date: "2026-05-01",
  amount: "750000",
  currency: "NGN",
  billing_cycle: "monthly",
  staff_count: "4",
  equipment_count: "2",
  status: "pending",
  auto_renew: "1",
  notes: "Client requires armed escort for executive movements within Lagos.",
  client: {
    id: 101,
    name: "Zenith Bank Plc",
    email: "security@zenithbank.com",
    address: "Plot 84 Ajose Adeogun Street, Victoria Island",
    location: "Lagos",
    service: "Armed Escort",
    staff_number: "4",
  },
};

const dummyManualPayment = {
  id: 1,
  payment_date: "2026-03-28",
  teller_reference: "TRN-00123456",
  proof_of_payment: "/dummy-proof.jpg",
  status: "pending" as PaymentStatus,
  submitted_at: "2026-03-28T10:15:00Z",
};

export default function ServiceDetailPage() {
  const router = useRouter();

  const [service] = useState(dummyService);
  const [manualPayment] = useState(dummyManualPayment);
  const [loading] = useState(false);

  const [addAmountOpen, setAddAmountOpen] = useState(false);
  const [addAmountValue, setAddAmountValue] = useState("");
  const [submittingAmount, setSubmittingAmount] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);

  const isActive = service.status.toLowerCase() === "active";
  const autoRenew = service.auto_renew === "1";

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return "—";
    }
  };

  const handleAddAmount = () => {
    if (!addAmountValue.trim()) return toast.error("Please enter an amount");
    setSubmittingAmount(true);
    setTimeout(() => {
      toast.success("Amount added successfully (Demo)");
      setAddAmountOpen(false);
      setAddAmountValue("");
      setSubmittingAmount(false);
    }, 800);
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "approved":
        return { className: "bg-green-100 text-green-700", label: "Approved" };
      case "rejected":
        return { className: "bg-red-100 text-red-600", label: "Rejected" };
      default:
        return { className: "bg-amber-100 text-amber-700", label: "Pending" };
    }
  };

  return (
    <div className="pb-10">
      <div className="flex justify-between md:items-center flex-col md:flex-row">
        <div className="flex items-center gap-3 mb-6">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="bg-primary-foreground hover:text-white text-black dark:text-white dark:hover:text-black"
          >
            <IoChevronBackOutline className="h-5 w-5" />
          </Button>
          <HeaderContent
            title={`${service.service_name} • ${service.client.name}`}
            description="Service contract overview and billing details"
          />
        </div>

        <div className="flex items-center gap-2 mb-6 md:mb-0">
          {manualPayment && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => setManualPaymentOpen(true)}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Manual Payment
            </Button>
          )}

          <Button
            size="sm"
            className="gap-1 bg-[#FAB435]/30 text-[#FAB435] hover:text-white"
            onClick={() => setDeployModalOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Deploy Staff
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col xl:flex-row gap-6">
        {/* Main Details Card */}
        <div className="bg-primary-foreground shadow-lg rounded-lg flex-1">
          <div className="p-5 border-b border-[#979797]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="font-bold text-[15px] dark:text-white text-[#3A3A3A]">
              Service Information
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddAmountOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Amount
              </Button>

              <Badge
                variant={isActive ? "default" : "destructive"}
                className={isActive ? "bg-green-600 text-white" : ""}
              >
                {service.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6 p-5">
            <DetailItem icon={Shield} label="Service" value={service.service_name} />
            <DetailItem icon={Building} label="Client" value={service.client.name} />
            <DetailItem icon={Users} label="Staff Deployed" value={service.staff_count} />
            <DetailItem icon={Clock} label="Equipment" value={service.equipment_count} />
            <DetailItem icon={Calendar} label="Start Date" value={formatDate(service.start_date)} />
            <DetailItem icon={Calendar} label="End Date" value={formatDate(service.end_date)} />
            <DetailItem icon={Calendar} label="Next Payment" value={formatDate(service.next_payment_date)} />
            <DetailItem
              icon={DollarSign}
              label="Amount"
              value={`${service.currency} ${Number(service.amount).toLocaleString()}`}
            />
            <DetailItem
              icon={Clock}
              label="Billing Cycle"
              value={service.billing_cycle.charAt(0).toUpperCase() + service.billing_cycle.slice(1)}
            />
            <DetailItem
              icon={RefreshCw}
              label="Auto Renew"
              value={autoRenew ? "Enabled" : "Disabled"}
              colored={autoRenew ? "text-green-600" : "text-orange-600"}
            />
          </div>

          {service.notes && (
            <div className="p-5 border-t border-[#979797]/30">
              <h3 className="text-sm font-medium text-[#979797] mb-2">Notes</h3>
              <p className="text-[#3A3A3A] dark:text-[#e0e0e0] text-[14px] leading-relaxed">
                {service.notes}
              </p>
            </div>
          )}
        </div>

        {/* Client Snapshot */}
        <div className="bg-primary-foreground shadow-lg rounded-lg xl:w-[340px] shrink-0 h-fit">
          <h2 className="font-bold text-[15px] dark:text-white text-[#3A3A3A] pb-3 border-b p-5 border-[#979797]/30">
            Client Snapshot
          </h2>
          <div className="p-5 space-y-5">
            <DetailItem icon={Building} label="Name" value={service.client.name} />
            <DetailItem icon={FileText} label="Email" value={service.client.email} />
            <DetailItem icon={FileText} label="Location" value={service.client.location} />
            <DetailItem icon={Users} label="Requested Staff" value={service.client.staff_number} />
            <DetailItem icon={Shield} label="Primary Service" value={service.client.service} />
          </div>
        </div>
      </div>

      {/* Manual Payment Dialog */}
      {manualPayment && (
        <Dialog open={manualPaymentOpen} onOpenChange={setManualPaymentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-amber-500" />
                Manual Payment Details
              </DialogTitle>
              <DialogDescription>
                Payment submitted by the client for review.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-[#979797] uppercase tracking-wider">Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    getPaymentStatusBadge(manualPayment.status).className
                  }`}
                >
                  {getPaymentStatusBadge(manualPayment.status).label}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">Payment Date</p>
                <p className="text-[14px] font-medium text-[#3A3A3A]">{manualPayment.payment_date}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">Teller Reference</p>
                <p className="text-[14px] font-mono font-semibold">{manualPayment.teller_reference}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-2">Proof of Payment</p>
                <Button
                  variant="outline"
                  className="w-full text-amber-600 border-amber-200"
                  onClick={() => toast.info("Proof preview not available in demo mode")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Document
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setManualPaymentOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Amount Dialog */}
      <Dialog open={addAmountOpen} onOpenChange={setAddAmountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Amount to Service</DialogTitle>
            <DialogDescription>
              Enter the amount to add to service ID {service.id} ({service.service_name}).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              value={addAmountValue}
              onChange={(e) => setAddAmountValue(e.target.value)}
              placeholder="150000"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAmountOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAmount} disabled={submittingAmount}>
              {submittingAmount ? "Adding..." : "Add Amount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy Staff Modal Placeholder */}
      <Dialog open={deployModalOpen} onOpenChange={setDeployModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Staff</DialogTitle>
            <DialogDescription>Demo mode - No real deployment</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-gray-500">
            Deploy staff functionality coming soon
          </div>
          <DialogFooter>
            <Button onClick={() => setDeployModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  colored = "",
}: {
  icon: any;
  label: string;
  value: string;
  colored?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <Icon className="h-4.5 w-4.5 text-[#DC9E2E]" />
      </div>
      <div>
        <p className="text-[12px] font-medium text-[#979797]">{label}</p>
        <p className={`text-[14px] font-medium dark:text-white ${colored}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}