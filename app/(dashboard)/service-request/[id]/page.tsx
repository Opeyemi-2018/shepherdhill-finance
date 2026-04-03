/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/token";
import { ThreeDots } from "react-loader-spinner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  DollarSign,
  Users,
  Shield,
  FileText,
  Building,
  RefreshCw,
  Clock,
  Plus,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import HeaderContent from "@/components/HeaderContent";
import { getServiceDetails, addServiceAmount } from "@/actions/requestService";
import { IoChevronBackOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useStaff } from "@/hooks/useStaff";
import DeployStaffModal from "./chuncks/DeployStaff";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManualPayment {
  id: number;
  payment_date: string;
  teller_reference: string;
  proof_of_payment: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
}

interface ServiceDetail {
  id: number;
  service_name: string;
  start_date: string;
  end_date: string;
  next_payment_date: string;
  amount: string;
  currency: string;
  billing_cycle: string;
  staff_count: string;
  equipment_count: string;
  status: string;
  auto_renew: string;
  notes: string | null;
  client: {
    id: number;
    name: string;
    email: string;
    address: string;
    location: string;
    service: string;
    staff_number: string;
  };
}

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
// Dummy service detail and manual payment records for IDs 9001 and 9002.
// These mirror what the real API would return so the UI flow is realistic.

const DUMMY_DETAIL_MAP: Record<
  number,
  ServiceDetail & { manual_payment: ManualPayment }
> = {
  9001: {
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
    manual_payment: {
      id: 1,
      payment_date: "2026-03-28",
      teller_reference: "TRN-00123456",
      proof_of_payment: "/dummy-proof-1.jpg",
      status: "pending",
      submitted_at: "2026-03-28T10:15:00Z",
    },
  },
  9002: {
    id: 9002,
    service_name: "Static Guard",
    start_date: "2026-04-05",
    end_date: "2027-04-05",
    next_payment_date: "2026-05-05",
    amount: "1200000",
    currency: "NGN",
    billing_cycle: "monthly",
    staff_count: "8",
    equipment_count: "4",
    status: "pending",
    auto_renew: "0",
    notes: "8 static guards deployed across 2 access points at head office.",
    client: {
      id: 102,
      name: "Access Holdings",
      email: "facilities@accessholdings.ng",
      address: "Plot 999C Danmole Street, Victoria Island",
      location: "Lagos",
      service: "Static Guard",
      staff_number: "8",
    },
    manual_payment: {
      id: 2,
      payment_date: "2026-03-29",
      teller_reference: "TRN-00789012",
      proof_of_payment: "/dummy-proof-2.pdf",
      status: "pending",
      submitted_at: "2026-03-29T14:30:00Z",
    },
  },
};
// ─────────────────────────────────────────────────────────────────────────────

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<ServiceDetail | null>(null);
  // DUMMY: manual payment — populated only for dummy rows
  const [manualPayment, setManualPayment] = useState<ManualPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addAmountOpen, setAddAmountOpen] = useState(false);
  const [addAmountValue, setAddAmountValue] = useState("");
  const [submittingAmount, setSubmittingAmount] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  // DUMMY: controls the manual payment dialog visibility
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);

  const { staffData, loading: staffLoading } = useStaff();
  const staffList =
    staffData?.staff?.staff_data?.map((s) => ({ id: s.id, name: s.name })) || [];

  useEffect(() => {
    if (!token || !id) return;

    const numericId = Number(id);

    // DUMMY: if the ID matches a dummy row, use local data instead of API
    if (DUMMY_DETAIL_MAP[numericId]) {
      const dummy = DUMMY_DETAIL_MAP[numericId];
      setService(dummy);
      setManualPayment(dummy.manual_payment);
      setLoading(false);
      return;
    }

    // Real API fetch for non-dummy IDs
    const fetchDetails = async () => {
      setLoading(true);
      const result = await getServiceDetails(token, id);
      if (result.success) {
        setService(result.data);
        setManualPayment(null); // real rows have no dummy manual payment
      } else {
        setError(result.message || "Could not load service details");
      }
      setLoading(false);
    };

    fetchDetails();
  }, [token, id]);

  const handleAddAmount = async () => {
    if (!token || !service || !addAmountValue.trim()) return;
    const amountNum = Number(addAmountValue);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    setSubmittingAmount(true);
    const result = await addServiceAmount(token, {
      service_id: service.id,
      amount: addAmountValue,
    });
    setSubmittingAmount(false);
    if (result.success) {
      toast.success(result.message || "Amount added successfully");
      const fresh = await getServiceDetails(token, id);
      if (fresh.success) setService(fresh.data);
      setAddAmountOpen(false);
      setAddAmountValue("");
    } else {
      toast.error(result.message || "Failed to add amount");
    }
  };

  const formatDate = (dateStr: string) =>
    dateStr ? format(new Date(dateStr), "dd MMM yyyy") : "—";

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateStr;
    }
  };

  if (!token)
    return (
      <div className="p-8 text-center text-destructive">
        Please log in to view service details
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );

  if (loading || !service)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ThreeDots height="60" width="60" color="#DC9E2E" visible />
      </div>
    );

  const isActive = service.status.toLowerCase() === "active";
  const autoRenew = service.auto_renew === "1";

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
          {/* DUMMY: Manual Payment button — only shown for dummy rows with a manual payment attached */}
          {manualPayment && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700/40 dark:text-amber-400 dark:hover:bg-amber-900/10"
              onClick={() => setManualPaymentOpen(true)}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Manual Payment
            </Button>
          )}

          <Button
            size="sm"
            className="gap-1 bg-[#FAB435]/30 text-[#FAB435] hover:text-white dark:hover:text-black"
            onClick={() => setDeployModalOpen(true)}
            disabled={staffLoading || staffList.length === 0}
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
              <Dialog open={addAmountOpen} onOpenChange={setAddAmountOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Amount
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Amount to Service</DialogTitle>
                    <DialogDescription>
                      Enter the amount to add to service ID {service.id} (
                      {service.service_name}).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="amount">Amount ({service.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="e.g. 1500"
                      value={addAmountValue}
                      onChange={(e) => setAddAmountValue(e.target.value)}
                      disabled={submittingAmount}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddAmountOpen(false)}
                      disabled={submittingAmount}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAmount}
                      disabled={submittingAmount || !addAmountValue.trim()}
                      className="bg-[#DC9E2E] hover:bg-[#c88c29] text-white"
                    >
                      {submittingAmount ? "Adding..." : "Add Amount"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Badge
                variant={isActive ? "default" : "destructive"}
                className={isActive ? "bg-green-600 hover:bg-green-700 text-white" : ""}
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
            <DetailItem icon={RefreshCw} label="Next Payment" value={formatDate(service.next_payment_date)} />
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

      {/* DUMMY: Manual Payment Details Dialog — triggered by button above */}
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
              {/* Status */}
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-[#979797] uppercase tracking-wider">
                  Status
                </p>
                {/* DUMMY: status badge */}
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    manualPayment.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : manualPayment.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {manualPayment.status === "approved" ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : manualPayment.status === "rejected" ? (
                    <XCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {manualPayment.status}
                </span>
              </div>

              <div className="border-t border-gray-100 dark:border-white/10" />

              {/* Payment Date */}
              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                  Payment Date
                </p>
                <p className="text-[14px] font-medium text-[#3A3A3A] dark:text-white">
                  {formatDate(manualPayment.payment_date)}
                </p>
              </div>

              {/* Teller Reference */}
              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                  Teller / Reference
                </p>
                <p className="text-[14px] font-mono font-semibold text-[#3A3A3A] dark:text-white">
                  {manualPayment.teller_reference || "—"}
                </p>
              </div>

              {/* Submitted At */}
              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                  Submitted At
                </p>
                <p className="text-[13px] text-[#3A3A3A] dark:text-[#979797]">
                  {formatDateTime(manualPayment.submitted_at)}
                </p>
              </div>

              {/* Proof of Payment */}
              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-2">
                  Proof of Payment
                </p>
                {/* DUMMY: replace href with real storage URL when wired to API */}
                <a
                  href={manualPayment.proof_of_payment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-[13px] font-medium hover:bg-amber-100 transition-colors"
                  onClick={(e) => {
                    // DUMMY: block broken link navigation on dummy paths
                    e.preventDefault();
                    toast.info("Proof preview not available in demo mode.");
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Document
                </a>
              </div>
            </div>

            {/* DUMMY: Approve / Reject — wire to real endpoints when API is ready */}
            <DialogFooter className="gap-2 sm:gap-2 flex-row">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                onClick={() =>
                  toast.info("Approve action will be wired to the API.")
                }
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                onClick={() =>
                  toast.info("Reject action will be wired to the API.")
                }
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {service && (
        <DeployStaffModal
          open={deployModalOpen}
          onOpenChange={setDeployModalOpen}
          serviceId={service.id}
          clientId={service.client.id}
          staffList={staffList}
          onSuccess={() => {}}
        />
      )}
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