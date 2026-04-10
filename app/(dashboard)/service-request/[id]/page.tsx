/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  Loader2,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Eye,
  PlusCircle,
  Shield,
  Building,
  Users,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  getServiceDetails,
  addServiceAmount,
  updateServiceStatus,
} from "@/actions/requestService";
import { useAuth } from "@/context/user";

// ─── Types ─────────────────────────────────────────────────────────────
type PaymentStatus = "pending" | "approved" | "rejected";

interface Payment {
  id: number;
  payment_date: string;
  reference: string;
  teller_reference?: string;
  proof_of_payment: string;
  status: PaymentStatus;
  created_at: string;
  amount?: string;
  payment_gateway?: string;
  notes?: string;
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
  payment?: Payment;
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function ServiceDetailSkeleton() {
  return (
    <div className="pb-10">
      <div className="flex justify-between md:items-center flex-col md:flex-row">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-6 md:mb-0">
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="mt-6 flex flex-col xl:flex-row gap-6">
        <div className="bg-primary-foreground shadow-lg rounded-lg flex-1 p-5">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-5" />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-primary-foreground shadow-lg rounded-lg xl:w-[340px] shrink-0 h-fit p-5">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-5" />
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const [addAmountOpen, setAddAmountOpen] = useState(false);
  const [addAmountValue, setAddAmountValue] = useState("");
  const [submittingAmount, setSubmittingAmount] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    const fetchDetails = async () => {
      setLoading(true);
      const result = await getServiceDetails(token, id);
      if (result.success && result.data) {
        const serviceData = result.data.service;
        const paymentData = result.data.payment;

        setService(serviceData);

        if (paymentData) {
          setPayment(paymentData);
        }
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
      if (fresh.success && fresh.data) {
        setService(fresh.data.service);
        if (fresh.data.payment) {
          setPayment(fresh.data.payment);
        }
      }
      setAddAmountOpen(false);
      setAddAmountValue("");
    } else {
      toast.error(result.message || "Failed to add amount");
    }
  };

  const handleApprovePayment = async () => {
    if (!token || !service) return;

    setApproving(true);
    try {
      const result = await updateServiceStatus(token, {
        service_id: service.id.toString(),
        status: "active",
      });

      if (result.success) {
        toast.success("Service activated successfully!");
        // Refresh the page data
        const fresh = await getServiceDetails(token, id);
        if (fresh.success && fresh.data) {
          setService(fresh.data.service);
          if (fresh.data.payment) {
            setPayment(fresh.data.payment);
          }
        }
        setPaymentDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to activate service");
      }
    } catch (error) {
      console.error("Approve payment error:", error);
      toast.error("An error occurred while activating the service");
    } finally {
      setApproving(false);
    }
  };

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

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getProofOfPaymentUrl = (proofPath: string) => {
    if (!proofPath) return "#";
    return `https://shepherdhill.app.edubiller.com/storage/app/public/${proofPath}`;
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "approved":
        return {
          className: "bg-green-100 text-green-700",
          label: "Approved",
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-600",
          label: "Rejected",
          icon: <XCircle className="w-3 h-3" />,
        };
      default:
        return {
          className: "bg-amber-100 text-amber-700",
          label: "Pending",
          icon: <Clock className="w-3 h-3" />,
        };
    }
  };

  if (!token) {
    return (
      <div className="p-8 text-center text-destructive">
        Please log in to view service details
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (loading || !service) {
    return <ServiceDetailSkeleton />;
  }

  const isActive = service.status?.toLowerCase() === "active";
  const autoRenew = service.auto_renew === "1";
  const isPaymentPending = payment?.status === "pending";

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
            title={`${service.service_name} • ${service.client?.name || "—"}`}
            description="Service contract overview and billing details"
          />
        </div>

        <div className="flex items-center gap-2 mb-6 md:mb-0">
          {payment && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700/40 dark:text-amber-400 dark:hover:bg-amber-900/10"
              onClick={() => setPaymentDialogOpen(true)}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Payment Details
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddAmountOpen(true)}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add Amount
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
              <Badge
                variant={isActive ? "default" : "destructive"}
                className={isActive ? "bg-green-600 text-white" : ""}
              >
                {service.status?.toUpperCase() || "UNKNOWN"}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6 p-5">
            <DetailItem
              icon={Shield}
              label="Service"
              value={service.service_name}
            />
            <DetailItem
              icon={Building}
              label="Client"
              value={service.client?.name || "—"}
            />
            <DetailItem
              icon={Users}
              label="Staff Deployed"
              value={service.staff_count || "—"}
            />
            <DetailItem
              icon={Clock}
              label="Equipment"
              value={service.equipment_count || "—"}
            />
            <DetailItem
              icon={Calendar}
              label="Start Date"
              value={formatDate(service.start_date)}
            />
            <DetailItem
              icon={Calendar}
              label="End Date"
              value={formatDate(service.end_date)}
            />
            <DetailItem
              icon={Calendar}
              label="Next Payment"
              value={formatDate(service.next_payment_date)}
            />
            <DetailItem
              icon={DollarSign}
              label="Amount"
              value={`${service.currency || "NGN"} ${Number(service.amount || 0).toLocaleString()}`}
            />
            <DetailItem
              icon={Clock}
              label="Billing Cycle"
              value={
                service.billing_cycle
                  ? service.billing_cycle.charAt(0).toUpperCase() +
                    service.billing_cycle.slice(1)
                  : "—"
              }
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
            <DetailItem
              icon={Building}
              label="Name"
              value={service.client?.name || "—"}
            />
            <DetailItem
              icon={FileText}
              label="Email"
              value={service.client?.email || "—"}
            />
            <DetailItem
              icon={FileText}
              label="Location"
              value={service.client?.location || "—"}
            />
            <DetailItem
              icon={Users}
              label="Requested Staff"
              value={service.client?.staff_number || "—"}
            />
            <DetailItem
              icon={Shield}
              label="Primary Service"
              value={service.client?.service || "—"}
            />
          </div>
        </div>
      </div>

      {/* Payment Details Dialog */}
      {payment && (
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-amber-500" />
                Payment Details
              </DialogTitle>
              <DialogDescription>
                Payment submitted by the client for review.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-[#979797] uppercase tracking-wider">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${getPaymentStatusBadge(payment.status).className}`}
                >
                  {getPaymentStatusBadge(payment.status).icon}
                  {getPaymentStatusBadge(payment.status).label}
                </span>
              </div>

              <div className="border-t border-gray-100 dark:border-white/10" />

              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                  Payment Date
                </p>
                <p className="text-[14px] font-medium text-[#3A3A3A] dark:text-white">
                  {formatDate(payment.payment_date)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                  Reference / Transaction ID
                </p>
                <p className="text-[14px] font-mono font-semibold text-[#3A3A3A] dark:text-white">
                  {payment.reference || payment.teller_reference || "—"}
                </p>
              </div>

              {payment.payment_gateway && (
                <div>
                  <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                    Payment Gateway
                  </p>
                  <p className="text-[14px] font-medium text-[#3A3A3A] dark:text-white">
                    {payment.payment_gateway}
                  </p>
                </div>
              )}

              {payment.amount && (
                <div>
                  <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                    Amount
                  </p>
                  <p className="text-[14px] font-medium text-[#3A3A3A] dark:text-white">
                    {service.currency} {Number(payment.amount).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                  Submitted At
                </p>
                <p className="text-[13px] text-[#3A3A3A] dark:text-[#979797]">
                  {formatDateTime(payment.created_at)}
                </p>
              </div>

              {payment.notes && (
                <div>
                  <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-0.5">
                    Notes
                  </p>
                  <p className="text-[13px] text-[#3A3A3A] dark:text-[#979797]">
                    {payment.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-medium text-[#979797] uppercase tracking-wider mb-2">
                  Proof of Payment
                </p>
                {payment.proof_of_payment && (
                  <a
                    href={getProofOfPaymentUrl(payment.proof_of_payment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-[13px] font-medium hover:bg-amber-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Document
                  </a>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              {isPaymentPending && (
                <Button
                  onClick={handleApprovePayment}
                  disabled={approving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                >
                  {approving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve &
                      Activate
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
              >
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
              value={addAmountValue}
              onChange={(e) => setAddAmountValue(e.target.value)}
              placeholder="e.g. 150000"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAmountOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAmount}
              disabled={submittingAmount}
              className="bg-[#DC9E2E] hover:bg-[#c88c29] text-white"
            >
              {submittingAmount ? "Adding..." : "Add Amount"}
            </Button>
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
