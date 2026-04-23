/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/user";

interface Contact {
  id: number;
  form_id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
}

interface Territory {
  id: number;
  form_id: string;
  region: string;
  zone: string;
  ops_officer_in_charge: string;
  hod_in_charge: string;
  credit_controller_region: string;
  business_dev_manager: string;
  ops_officer?: { id: number; name: string };
  hod?: { id: number; name: string };
  credit_controller?: { id: number; name: string };
  bdm?: { id: number; name: string };
  responsible_staff?: { id: number; name: string };
  operations_manager?: { id: number; name: string };
}

interface Service {
  id: number;
  form_id: string;
  service_id: string;
  grade: string;
  shift_pattern: string;
  guard_monthly_net: string;
  quantity: number;
  gross_billing_per_guard: string;
  billing_per_month: string;
}

interface Equipment {
  id: number;
  form_id: string;
  device: string;
  cost: string | null;
  quantity: number;
  monthly_service_cost: string;
  billing_per_month: string;
}

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
    phone: string;
    user?: {
      id: number;
      signature: string | null;
    };
  };
}

interface RetainershipDetail {
  id: number;
  client_id: string;
  code: string;
  issue_date: string;
  revision_date: string | null;
  new_activation: boolean;
  client: {
    id: number;
    name: string;
    email: string;
    address: string;
    location: string;
    service: string;
    start_date?: string;
    payroll_cycle?: string;
  };
  contacts: Contact[];
  territories: Territory;
  services: Service[];
  equipments: Equipment[];
  signatories: Signatory[];
}

export default function RetainershipFormDetail() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const code = params.code as string;
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<RetainershipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Update the fetchFormDetail function to capture and display the server error message:

    const fetchFormDetail = async () => {
      if (!token) {
        setError("Please log in");
        setLoading(false);
        return;
      }

      if (!code) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/retainership/form/${code}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const json = await res.json();

        if (!res.ok) {
          // Display the error message from the server
          const errorMessage = json.message || "Failed to fetch form details";
          setError(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        if (json.status) {
          setFormData(json.data);
        } else {
          const errorMessage = json.message || "Invalid response";
          setError(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (err: any) {
        console.error(err);
        // Error already set above, but ensure it's shown
        if (!error) {
          const errorMessage =
            err.message || "Could not load retainership form details";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormDetail();
  }, [token, code]);

  const downloadAsPDF = async () => {
    if (!formRef.current) return;
    setDownloading(true);
    try {
      const el = formRef.current;

      // Clone the element into an off-screen container at a fixed wide width
      // This avoids mutating the live DOM and prevents right-side cutoff
      const RENDER_WIDTH = 1200;

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = "-99999px";
      wrapper.style.left = "-99999px";
      wrapper.style.width = `${RENDER_WIDTH}px`;
      wrapper.style.background = "#ffffff";
      wrapper.style.zIndex = "-1";
      document.body.appendChild(wrapper);

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.maxWidth = "none";
      clone.style.width = `${RENDER_WIDTH}px`;
      clone.style.overflow = "visible";
      clone.style.margin = "0";
      wrapper.appendChild(clone);

      // Wait for layout
      await new Promise((resolve) => setTimeout(resolve, 150));

      const cloneHeight = clone.scrollHeight;

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: RENDER_WIDTH,
        height: cloneHeight,
        style: {
          width: `${RENDER_WIDTH}px`,
          height: `${cloneHeight}px`,
        },
      });

      document.body.removeChild(wrapper);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (cloneHeight * imgWidth) / RENDER_WIDTH;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${formData?.code || "retainership-form"}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error(err);
      // Clean up wrapper if error
      const staleWrapper = document.querySelector("[data-pdf-wrapper]");
      if (staleWrapper) document.body.removeChild(staleWrapper);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  // Calculate totals
  const totalServiceBilling =
    formData?.services.reduce(
      (sum, service) => sum + parseFloat(service.billing_per_month || "0"),
      0,
    ) || 0;

  const totalEquipmentBilling =
    formData?.equipments.reduce(
      (sum, equipment) => sum + parseFloat(equipment.billing_per_month || "0"),
      0,
    ) || 0;

  const grandTotal = totalServiceBilling + totalEquipmentBilling;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#FAB435]" />
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="p-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <p className="text-red-600">{error || "Form not found"}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
        <Button
          onClick={downloadAsPDF}
          disabled={downloading}
          className="bg-[#FAB435] hover:bg-[#E89500] text-black"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Download as PDF
        </Button>
      </div>

      <div
        ref={formRef}
        className="bg-white font-serif text-black p-4 max-w-5xl mx-auto text-sm border border-black"
      >
        {/* Header */}
        <div className="flex items-stretch border border-black">
          <div className="w-36 border-r border-black flex items-center justify-center min-h-[96px] p-2">
            <img
              src="/shepherdhill-logo.svg"
              alt="Shepherd Hill Logo"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex-1 flex items-center justify-center border-r border-black px-4 py-2">
            <h1 className="text-2xl font-bold text-center leading-tight">
              CLIENT&apos;S RETAINERSHIP FORM
              <br />
              (GUARD SECURITY SERVICES)
            </h1>
          </div>
          <div className="w-48 text-xs flex flex-col">
            <div className="flex border-b border-black">
              <span className="font-bold px-2 py-1 w-28 border-r border-black">
                CODE:
              </span>
              <span className="px-2 py-1 flex-1">{formData.code}</span>
            </div>
            <div className="flex border-b border-black">
              <span className="font-bold px-2 py-1 w-28 border-r border-black">
                ISSUE:
              </span>
              <span className="px-2 py-1 flex-1">1</span>
            </div>
            <div className="flex border-b border-black">
              <span className="font-bold px-2 py-1 w-28 border-r border-black">
                Date of issue:
              </span>
              <span className="px-2 py-1 flex-1">
                {new Date(formData.issue_date).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex">
              <span className="font-bold px-2 py-1 w-28 border-r border-black">
                REVISION DATE:
              </span>
              <span className="px-2 py-1 flex-1">
                {formData.revision_date
                  ? new Date(formData.revision_date).toLocaleDateString("en-GB")
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-t-0 border-black">
          <div className="px-2 py-1 font-bold text-center border-b border-black text-xs">
            According to Standard ISO 9001-2015
          </div>

          <div className="bg-[#bf9000] text-black font-bold px-2 py-1 text-center border-b border-black text-xs">
            CONTRACT DETAIL:{" "}
            {formData.new_activation ? "ACTIVATION" : "EXPANSION"}
          </div>

          {/* Client info */}
          <div className="flex border-b border-black text-xs">
            <span className="font-bold px-2 py-1 w-48 border-r border-black shrink-0">
              CLIENT NAME:
            </span>
            <span className="flex-1 px-2 py-1 font-bold">
              {formData.client.name}
            </span>
          </div>
          <div className="flex border-b border-black text-xs">
            <span className="font-bold px-2 py-1 w-48 border-r border-black shrink-0">
              CLIENT OFFICE ADDRESS:
            </span>
            <span className="flex-1 px-2 py-1">
              {formData.client.address || "N/A"}
            </span>
          </div>
          <div className="flex border-b border-black text-xs">
            <span className="font-bold px-2 py-1 w-48 border-r border-black shrink-0">
              LOCATION NAME/ADDRESS:
            </span>
            <span className="flex-1 px-2 py-1 font-bold">
              {formData.client.location || "N/A"}
            </span>
          </div>
          <div className="flex border-b border-black text-xs">
            <span className="font-bold px-2 py-1 w-48 border-r border-black shrink-0">
              STARTING DATE:
            </span>
            <span className="flex-1 px-2 py-1 border-r border-black font-bold">
              {formData.client.start_date
                ? new Date(formData.client.start_date).toLocaleDateString(
                    "en-GB",
                  )
                : "N/A"}
            </span>
            <span className="font-bold px-2 py-1 w-36 border-r border-black">
              NEW ACTIVATION:
            </span>
            <span className="px-2 py-1 w-16 font-bold text-center">
              {formData.new_activation ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex border-b border-black text-xs">
            <span className="font-bold px-2 py-1 w-48 border-r border-black shrink-0">
              PAYMENT CYCLE:
            </span>
            <span className="flex-1 px-2 py-1 border-r border-black">
              {formData.client.payroll_cycle || "Monthly"}
            </span>
            <span className="font-bold px-2 py-1 w-36 border-r border-black">
              ADDITION:
            </span>
            <span className="px-2 py-1 w-16"></span>
          </div>

          {/* Contact details */}
          <div className="bg-[#bf9000] text-black font-bold px-2 py-1 text-center border-b border-black text-xs">
            CONTACT DETAILS:
            <span className="float-right font-normal">EXPANSION</span>
          </div>
          <div className="flex border-b border-black text-xs font-bold">
            <span className="px-2 py-1 w-36 border-r border-black">
              DESIGNATION
            </span>
            <span className="flex-1 px-2 py-1 border-r border-black">NAME</span>
            <span className="w-36 px-2 py-1 border-r border-black">
              MOBILE NO.
            </span>
            <span className="flex-1 px-2 py-1">EMAIL ADDRESS</span>
          </div>
          {["SERVICE CONTACT", "FINANCIAL CONTACT", "FACILITY MANAGER"].map(
            (role) => {
              const contact = formData.contacts.find((c) => c.role === role);
              return (
                <div key={role} className="flex border-b border-black text-xs">
                  <span className="px-2 py-1 w-36 border-r border-black font-bold">
                    {role}:
                  </span>
                  <span className="flex-1 px-2 py-1 border-r border-black">
                    {contact?.name || ""}
                  </span>
                  <span className="w-36 px-2 py-1 border-r border-black">
                    {contact?.phone || ""}
                  </span>
                  <span className="flex-1 px-2 py-1 text-blue-600 underline">
                    {contact?.email || ""}
                  </span>
                </div>
              );
            },
          )}

          {/* Territorial details */}
          <div className="bg-[#bf9000] text-black font-bold px-2 py-1 text-center border-b border-black text-xs">
            TERRITORIAL DETAILS/ CLASSIFICATION
          </div>
          {[
            {
              left: "REGION",
              lval: formData.territories?.region || "N/A",
              right: "HOD IN CHARGE",
              rval: formData.territories?.hod?.name || "N/A",
            },
            {
              left: "ZONE / AREA",
              lval: formData.territories?.zone || "N/A",
              right: "OPERATIONS MANAGER",
              rval: formData.territories?.operations_manager?.name || "N/A",
            },
            {
              left: "OPS. OFFICER IN CHARGE",
              lval: formData.territories?.ops_officer?.name || "N/A",
              right: "CREDIT CONTROLLER (REGION)",
              rval: formData.territories?.credit_controller?.name || "N/A",
            },
            {
              left: "RESPONSIBLE STAFF",
              lval: formData.territories?.responsible_staff?.name || "N/A",
              right: "BUSINESS DEV. MANAGER",
              rval: formData.territories?.bdm?.name || "N/A",
            },
          ].map((row, i) => (
            <div key={i} className="flex border-b border-black text-xs">
              <span className="font-bold px-2 py-1 w-36 border-r border-black">
                {row.left}
              </span>
              <span className="px-2 py-1 w-28 text-center border-r border-black">
                {row.lval}
              </span>
              <span className="font-bold px-2 py-1 flex-1 border-r border-black">
                {row.right}
              </span>
              <span className="px-2 py-1 w-44 text-center">{row.rval}</span>
            </div>
          ))}

          {/* Service requirement */}
          <div className="bg-[#bf9000] text-black font-bold px-2 py-1 text-center border-b border-black text-xs">
            SERVICE REQUIREMENT
          </div>
          <div className="flex border-b border-black text-xs font-bold">
            <span className="flex-1 px-2 py-1 border-r border-black">
              GRADE (Male/Female)
            </span>
            <span className="w-20 px-2 py-1 border-r border-black text-center">
              Shift Pattern
            </span>
            <span className="w-24 px-2 py-1 border-r border-black text-center">
              Guard Monthly Net
            </span>
            <span className="w-10 px-2 py-1 border-r border-black text-center">
              No.
            </span>
            <span className="w-32 px-2 py-1 border-r border-black text-right">
              Gross Billing Per Guard
            </span>
            <span className="w-36 px-2 py-1 text-right">
              Billing Per Month (Naira)
            </span>
          </div>
          {formData.services.map((service, idx) => (
            <div key={idx} className="flex border-b border-black text-xs">
              <span className="font-bold flex-1 px-2 py-1 border-r border-black">
                {service.grade}
              </span>
              <span className="w-20 px-2 py-1 border-r border-black text-center">
                {service.shift_pattern}
              </span>
              <span className="w-24 px-2 py-1 border-r border-black text-center">
                {parseFloat(service.guard_monthly_net || "0").toLocaleString()}
              </span>
              <span className="w-10 px-2 py-1 border-r border-black text-center font-bold">
                {service.quantity}
              </span>
              <span className="w-32 px-2 py-1 border-r border-black text-right">
                {parseFloat(
                  service.gross_billing_per_guard || "0",
                ).toLocaleString()}
              </span>
              <span className="w-36 px-2 py-1 text-right">
                ₦{parseFloat(service.billing_per_month || "0").toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex border-b-2 border-black text-xs font-bold">
            <span className="flex-1 px-2 py-1 border-r border-black">
              TOTAL
            </span>
            <span className="w-20 px-2 py-1 border-r border-black"></span>
            <span className="w-24 px-2 py-1 border-r border-black"></span>
            <span className="w-10 px-2 py-1 border-r border-black"></span>
            <span className="w-32 px-2 py-1 border-r border-black"></span>
            <span className="w-36 px-2 py-1 text-right">
              ₦{totalServiceBilling.toLocaleString()}
            </span>
          </div>

          {/* Equipment */}
          <div className="bg-[#bf9000] text-black font-bold px-2 py-1 text-center border-b border-black text-xs">
            EQUIPMENT / OTHER ACCESSORIES
          </div>
          <div className="flex border-b border-black text-xs font-bold">
            <span className="flex-1 px-2 py-1 border-r border-black">
              DEVICE
            </span>
            <span className="w-24 px-2 py-1 border-r border-black text-center">
              Unit cost (Naira)
            </span>
            <span className="w-10 px-2 py-1 border-r border-black">No.</span>
            <span className="w-32 px-2 py-1 border-r border-black">
              Monthly Service Cost
            </span>
            <span className="w-36 px-2 py-1">Billing per Month (Naira)</span>
          </div>
          {formData.equipments.map((equipment, idx) => (
            <div key={idx} className="flex border-b border-black text-xs">
              <span className="font-bold flex-1 px-2 py-1 border-r border-black">
                {equipment.device}
              </span>
              <span className="w-24 px-2 py-1 border-r border-black text-center">
                {equipment.cost
                  ? parseFloat(equipment.cost).toLocaleString()
                  : ""}
              </span>
              <span className="w-10 px-2 py-1 border-r border-black text-center">
                {equipment.quantity}
              </span>
              <span className="w-32 px-2 py-1 border-r border-black text-right">
                {parseFloat(
                  equipment.monthly_service_cost || "0",
                ).toLocaleString()}
              </span>
              <span className="w-36 px-2 py-1 text-right">
                ₦
                {parseFloat(
                  equipment.billing_per_month || "0",
                ).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex border-b border-black text-xs font-bold">
            <span className="flex-1 px-2 py-1 border-r border-black">
              TOTAL
            </span>
            <span className="w-24 px-2 py-1 border-r border-black"></span>
            <span className="w-10 px-2 py-1 border-r border-black"></span>
            <span className="w-32 px-2 py-1 border-r border-black"></span>
            <span className="w-36 px-2 py-1 text-right">
              ₦{totalEquipmentBilling.toLocaleString()}
            </span>
          </div>
          <div className="flex border-b-2 border-black text-xs font-bold">
            <span className="flex-1 px-2 py-1 border-r border-black">
              GRAND TOTAL
            </span>
            <span className="w-24 px-2 py-1 border-r border-black"></span>
            <span className="w-10 px-2 py-1 border-r border-black"></span>
            <span className="w-32 px-2 py-1 border-r border-black"></span>
            <span className="w-36 px-2 py-1 text-right">
              ₦{grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
        {formData.signatories
          .filter((sig: Signatory) => sig.status === "signed")
          .map((sig: Signatory, index: number) => {
            const signatureUrl = sig.employee?.user?.signature
              ? `https://shepherdhill.edubiller.com/public/${sig.employee.user.signature}`
              : null;

            return (
              <div
                key={sig.id || index}
                className="flex text-xs border-b border-black last:border-b-0"
              >
                <span className="flex-1 px-2 py-3 font-bold border-r border-black">
                  NAME: {sig.employee?.name || "N/A"}
                </span>
                <span className="flex-1 px-2 py-3 font-bold border-r border-black">
                  ROLE: {sig.role}
                </span>
                <span className="flex-1 px-2 py-3 border-r border-black">
                  {signatureUrl ? (
                    <button
                      onClick={() => {
                        setSelectedSignature(signatureUrl);
                        setIsDialogOpen(true);
                      }}
                      className="text-blue-600 underline hover:text-blue-800 font-medium"
                    >
                      ✓ View Signature
                    </button>
                  ) : (
                    <span className="text-gray-500">No Signature</span>
                  )}
                </span>
                <span className="w-44 px-2 py-3 font-bold">
                  DATE:{" "}
                  {sig.signed_at
                    ? new Date(sig.signed_at).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
            );
          })}
        {/* <div className="border border-t-0 border-black px-2 py-2 text-xs">
          <p className="font-bold underline mb-1">Please include and tick</p>
          <p className="mb-1">✓ Proposal Letter</p>
          <p className="mb-1">✓ Risk Assessment</p>
          <p>✓ Manning Structure</p>
        </div> */}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedSignature ? (
            <img
              src={selectedSignature}
              alt="Signature"
              className="w-full h-auto object-contain"
            />
          ) : (
            <p>No signature available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
