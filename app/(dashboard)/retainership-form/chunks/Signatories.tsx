/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  FileSignature,
  CheckCircle,
  User,
  ArrowLeft,
  Package,
  Shield,
  Backpack,
  BackpackIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/user";

interface Signatory {
  id: number;
  form_id: string;
  employee_id: string;
  role: string;
  status: string;
  signed_at: string | null;
  employee: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

interface Service {
  id: number;
  grade: string;
  shift_pattern: string;
  guard_monthly_net: string;
  quantity: number;
  gross_billing_per_guard: string;
  billing_per_month: string;
}

interface Equipment {
  id: number;
  device: string;
  cost: string | null;
  quantity: number;
  monthly_service_cost: string;
  billing_per_month: string;
}

interface SignatoriesData {
  form_code: string;
  client_name: string;
  issue_date: string;
  signatories: Signatory[];
  services?: Service[];
  equipments?: Equipment[];
}

interface SignFormViewProps {
  formCode: string;
  onBack: () => void;
  onSignComplete?: () => void;
}

 export function SignFormView({
  formCode,
  onBack,
  onSignComplete,
}: SignFormViewProps) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SignatoriesData | null>(null);
  const [signingId, setSigningId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSignatories();
  }, [formCode, token]);

  const fetchSignatories = async () => {
    if (!token || !user) return;

    try {
      const signatoryRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/retainership/signatory/${formCode}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const signatoryJson = await signatoryRes.json();

      const formRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/retainership/form/${formCode}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const formJson = await formRes.json();

      if (signatoryJson.status && formJson.status) {
        const raw = signatoryJson.data.signatories || [];
        const signatories: Signatory[] = Array.isArray(raw) ? raw : [raw];

        setData({
          form_code: signatoryJson.data.form_code || formCode,
          client_name: formJson.data.client?.name || "N/A",
          issue_date: formJson.data.issue_date,
          signatories,
          services: formJson.data.services || [],
          equipments: formJson.data.equipments || [],
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load signatories");
    } finally {
      setLoading(false);
    }
  };

  // Filter to show ONLY the signatory for the current logged-in user
  const currentUserSignatory = data?.signatories.find(
    (sig) =>
      sig.employee.name.toLowerCase() === user?.name.toLowerCase() ||
      sig.employee.email.toLowerCase() === user?.email.toLowerCase(),
  );

  const signedCount =
    data?.signatories.filter((s) => s.status === "signed").length || 0;
  const totalSignatories = data?.signatories.length || 0;

  const servicesList = data?.services ?? [];
  const equipmentsList = data?.equipments ?? [];

  const totalServiceBilling = servicesList.reduce(
    (sum, s) => sum + parseFloat(s.billing_per_month || "0"),
    0,
  );
  const totalEquipmentBilling = equipmentsList.reduce(
    (sum, e) => sum + parseFloat(e.billing_per_month || "0"),
    0,
  );
  const grandTotal = totalServiceBilling + totalEquipmentBilling;

  const handleSign = async (signatory: Signatory) => {
    if (!token || !data) return;

    setSigningId(signatory.id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/retainership/signature/update/${formCode}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signatory_id: String(signatory.id),
            status: "signed",
          }),
        },
      );

      const json = await res.json();

      if (json.status) {
        toast.success("Form signed successfully");

        setData((prev) =>
          prev
            ? {
                ...prev,
                signatories: prev.signatories.map((s) =>
                  s.id === signatory.id
                    ? {
                        ...s,
                        status: "signed",
                        signed_at: new Date().toISOString(),
                      }
                    : s,
                ),
              }
            : prev,
        );
        onSignComplete?.();
      } else {
        toast.error(json.message || "Failed to sign");
      }
    } catch (err) {
      toast.error("Could not sign form");
    } finally {
      setSigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#FAB435]" />
      </div>
    );
  }

  if (!data || !currentUserSignatory) {
    return (
      <>
        <button
          onClick={onBack}
          className="cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
        <div className="text-center py-12 text-gray-500">
          You are not authorized to sign this form loaded.
        </div>
      </>
    );
  }

  const isSigned = currentUserSignatory.status === "signed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      {/* Form Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Form Code</span>
            <span className="font-mono font-semibold">{data.form_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Client</span>
            <span className="font-medium">{data.client_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Issue Date</span>
            <span>{new Date(data.issue_date).toLocaleDateString("en-GB")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      {servicesList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Grade</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Shift Pattern
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Monthly Net
                    </th>
                    <th className="px-4 py-2 text-center font-semibold">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Gross/Guard
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Billing/Month
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {servicesList.map((service, idx) => (
                    <tr key={idx} className="">
                      <td className="px-4 py-2 font-medium">{service.grade}</td>
                      <td className="px-4 py-2">{service.shift_pattern}</td>
                      <td className="px-4 py-2 text-right">
                        ₦
                        {parseFloat(
                          service.guard_monthly_net || "0",
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-center font-bold">
                        {service.quantity}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ₦
                        {parseFloat(
                          service.gross_billing_per_guard || "0",
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-green-600">
                        ₦
                        {parseFloat(
                          service.billing_per_month || "0",
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className=" font-bold">
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right">
                      Total Services:
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">
                      ₦{totalServiceBilling.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment */}
      {equipmentsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Equipment & Accessories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">
                      Device
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Unit Cost
                    </th>
                    <th className="px-4 py-2 text-center font-semibold">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Monthly Service Cost
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Billing/Month
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {equipmentsList.map((equipment, idx) => (
                    <tr key={idx} className="hover:">
                      <td className="px-4 py-2 font-medium">
                        {equipment.device}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {equipment.cost
                          ? `₦${parseFloat(equipment.cost).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-center font-bold">
                        {equipment.quantity}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ₦
                        {parseFloat(
                          equipment.monthly_service_cost || "0",
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-purple-600">
                        ₦
                        {parseFloat(
                          equipment.billing_per_month || "0",
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className=" font-bold">
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right">
                      Total Equipment:
                    </td>
                    <td className="px-4 py-2 text-right text-purple-600">
                      ₦{totalEquipmentBilling.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grand Total */}
      {(servicesList.length > 0 || equipmentsList.length > 0) && (
        <Card className="bg-gradient-to-r from-[#FAB435]/10 to-transparent border-[#FAB435]">
          <CardContent className="">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Contract Value</p>
                <p className="text-xs text-gray-400">
                  Monthly recurring billing
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">GRAND TOTAL</p>
                <p className="text-3xl font-bold text-[#E89500]">
                  ₦{grandTotal.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">per month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div>
        <p className="text-sm text-gray-500 mt-1">
          {signedCount} of {totalSignatories} signatories have signed
        </p>
      </div>
      {/* Your Signature Section - Only current user */}
      <Card>
        <CardContent>
          <div
            className={`rounded-xl border p-6 ${isSigned ? "border-green-200 bg-green-50" : "border-gray-200 "}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#FAB435]/20 flex items-center justify-center">
                <User className="w-6 h-6 text-[#FAB435]" />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {currentUserSignatory.employee.name}
                </p>
                <p className="text-sm text-gray-500">
                  {currentUserSignatory.employee.email}
                </p>
              </div>
            </div>

            <p className="text-[#FAB435] font-medium mb-4">
              {currentUserSignatory.role}
            </p>

            {isSigned ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5" />
                Signed on{" "}
                {new Date(currentUserSignatory.signed_at!).toLocaleString()}
              </div>
            ) : (
              <Button
                onClick={() => handleSign(currentUserSignatory)}
                disabled={signingId !== null}
                className="w-full h-11 bg-[#FAB435] hover:bg-[#E89500] text-black"
              >
                {signingId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  "Sign This Form Now"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
