"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Shadcn/ui ────────────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Icons ────────────────────────────────────────────────────────────────────
import {
  Check,
  ChevronsUpDown,
  Users,
  MapPin,
  Wrench,
  Shield,
  Contact,
  Loader2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

// ─── Hooks ────────────────────────────────────────────────────────────────────

import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/context/user";
import { useServices } from "@/hooks/useService";
import { useClients } from "@/hooks/useClient";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContactDetail {
  role: string;
  name: string;
  email: string;
  phone: string;
}

interface Territory {
  region: string;
  zone: string;
  ops_officer_in_charge: string;
  responsible_staff: string;
  hod_in_charge: string;
  operations_manager: string;
  credit_controller_region: string;
  business_dev_manager: string;
}

interface Service {
  grade: string;
  shift_pattern: string;
  quantity: string;
}

interface Equipment {
  device: string;
  cost: string;
  monthly_service_cost: string;
  quantity: string;
}

interface Signatory {
  role: string;
  employee_id: string;
}

interface RetainershipForm {
  client_id: string;
  issue_date: string;
  new_activation: "1" | "0";
  contact_detail: ContactDetail[];
  teritories: Territory[];
  service: Service[];
  equipment: Equipment[];
  signatories: Signatory[];
}

// ─── Comboboxes ───────────────────────────────────────────────────────────────
interface ComboOption {
  id: string;
  name: string;
}

function StaffCombobox({
  value,
  onChange,
  options,
  placeholder = "Select staff...",
}: {
  value: string;
  onChange: (val: string) => void;
  options: ComboOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-transparent border-input hover:bg-accent text-left h-10 text-sm"
        >
          <span className="truncate">
            {selected ? (
              selected.name
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.id
                        ? "opacity-100 text-[#FAB435]"
                        : "opacity-0",
                    )}
                  />
                  {opt.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ClientCombobox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: ComboOption[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-transparent border-input hover:bg-accent text-left h-10 text-sm"
        >
          <span className="truncate">
            {selected ? (
              selected.name
            ) : (
              <span className="text-muted-foreground">Select client...</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>No client found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.id
                        ? "opacity-100 text-[#FAB435]"
                        : "opacity-0",
                    )}
                  />
                  {opt.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-lg bg-[#FAB435]/10">
        <Icon className="h-4 w-4 text-[#FAB435]" />
      </div>
      <div>
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm h-10">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
const AddRetainershipForm = () => {
  const router = useRouter();
  const { token } = useAuth();

 const { clients: clientData, isLoading: clientLoading } = useClients();
const { staffData, loading: staffLoading } = useStaff();
const { services: servicesData, isLoading: servicesLoading } = useServices();

  const [submitting, setSubmitting] = useState(false);

  // ── Combobox options ────────────────────────────────────────────────────────
  const staffOptions: ComboOption[] =
    staffData?.staff?.staff_data?.map((s) => ({
      id: String(s.id),
      name: s.name,
    })) ?? [];

  const clientOptions: ComboOption[] =
    clientData?.map((c) => ({
      id: String(c.id),
      name: c.name,
    })) ?? [];

  // FIX: Remove .data - servicesData is already the array
  const serviceGradeOptions: ComboOption[] =
    servicesData?.map((s) => ({
      id: String(s.id),
      name: `${s.name} — ₦${Number(s.rate).toLocaleString()}`,
    })) ?? [];

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<RetainershipForm>({
    client_id: "",
    issue_date: "",
    new_activation: "1",
    contact_detail: [
      { role: "SERVICE CONTACT", name: "", email: "", phone: "" },
      { role: "FINANCIAL CONTACT", name: "", email: "", phone: "" },
    ],
    teritories: [
      {
        region: "",
        zone: "",
        ops_officer_in_charge: "",
        responsible_staff: "",
        hod_in_charge: "",
        operations_manager: "",
        credit_controller_region: "",
        business_dev_manager: "",
      },
    ],
    service: [{ grade: "", shift_pattern: "24hrs", quantity: "" }],
    // device always "14" — forced at submit, never shown in UI
    equipment: [
      { device: "14", cost: "", monthly_service_cost: "", quantity: "" },
    ],
    signatories: [
      { role: "BUSINESS DEV. MANAGER", employee_id: "" },
      { role: "HUMAN RESOURCES MANAGER", employee_id: "" },
    ],
  });

  // ── Field updaters ──────────────────────────────────────────────────────────
  const updateContact = useCallback(
    (i: number, f: keyof ContactDetail, v: string) =>
      setForm((p) => {
        const a = [...p.contact_detail];
        a[i] = { ...a[i], [f]: v };
        return { ...p, contact_detail: a };
      }),
    [],
  );

  const updateTerritory = useCallback(
    (i: number, f: keyof Territory, v: string) =>
      setForm((p) => {
        const a = [...p.teritories];
        a[i] = { ...a[i], [f]: v };
        return { ...p, teritories: a };
      }),
    [],
  );

  const updateService = useCallback(
    (i: number, f: keyof Service, v: string) =>
      setForm((p) => {
        const a = [...p.service];
        a[i] = { ...a[i], [f]: v };
        return { ...p, service: a };
      }),
    [],
  );

  const updateEquipment = useCallback(
    (i: number, f: keyof Equipment, v: string) =>
      setForm((p) => {
        const a = [...p.equipment];
        a[i] = { ...a[i], [f]: v };
        return { ...p, equipment: a };
      }),
    [],
  );

  const updateSignatory = useCallback(
    (i: number, f: keyof Signatory, v: string) =>
      setForm((p) => {
        const a = [...p.signatories];
        a[i] = { ...a[i], [f]: v };
        return { ...p, signatories: a };
      }),
    [],
  );

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.client_id) {
      toast.error("Please select a client.");
      return;
    }

    if (!form.service[0]?.grade) {
      toast.error("Please select a service grade.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        client_id: String(form.client_id),
        // grade is the service id selected from serviceGradeOptions
        service: form.service,
        // device is always "14" — hardcoded, not shown in UI
        equipment: form.equipment.map((eq) => ({ ...eq, device: "14" })),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/retainership/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.errors
          ? Object.values(err.errors as Record<string, string[]>)
              .flat()
              .join(" · ")
          : (err?.message ?? `Error ${res.status}`);
        throw new Error(msg);
      }

      toast.success("Retainership generated successfully!");
      router.push("/retainership-form");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft
            onClick={() => router.back()}
            className="h-4 w-4 cursor-pointer"
          />
          <span>Retainerships</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">New Retainership</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-6 py-8 space-y-6"
      >
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Generate Retainership
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Fill in the details below to generate a new retainership contract.
          </p>
        </div>

        {/* ══ 1 · Basic Info ══════════════════════════════════════════════════ */}
        <div className="rounded-lg border bg-card p-6">
          <SectionHeader
            icon={Shield}
            title="Basic Information"
            description="Client, issue date and activation status"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Client">
              {clientLoading ? (
                <Spinner />
              ) : (
                <ClientCombobox
                  value={form.client_id}
                  onChange={(v) => setForm((p) => ({ ...p, client_id: v }))}
                  options={clientOptions}
                />
              )}
            </Field>

            <Field label="Issue Date">
              <Input
                type="date"
                value={form.issue_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, issue_date: e.target.value }))
                }
                required
              />
            </Field>

            {/* New Activation */}
            <div className="md:col-span-2 flex items-center justify-between p-4 rounded-lg border bg-muted/40">
              <div>
                <p className="text-sm font-medium">New Activation</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toggle on to mark this as a new activation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full transition-colors",
                    form.new_activation === "1"
                      ? "bg-[#FAB435]/20 text-[#FAB435]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {form.new_activation === "1" ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={form.new_activation === "1"}
                  onCheckedChange={(c) =>
                    setForm((p) => ({ ...p, new_activation: c ? "1" : "0" }))
                  }
                  className="data-[state=checked]:bg-[#FAB435]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ══ 2 · Contact Details ═════════════════════════════════════════════ */}
        <div className="rounded-lg border bg-card p-6">
          <SectionHeader
            icon={Contact}
            title="Contact Details"
            description="Service and financial contact persons"
          />
          <div className="space-y-6">
            {form.contact_detail.map((contact, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-6" />}
                <Badge
                  variant="outline"
                  className="border-[#FAB435]/30 text-[#FAB435] text-[10px] tracking-widest mb-4"
                >
                  {contact.role}
                </Badge>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name">
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact(i, "name", e.target.value)}
                      placeholder="John Doe"
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        updateContact(i, "email", e.target.value)
                      }
                      placeholder="john@mail.com"
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={contact.phone}
                      onChange={(e) =>
                        updateContact(i, "phone", e.target.value)
                      }
                      placeholder="080XXXXXXXX"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ 3 · Territory ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg border bg-card p-6">
          <SectionHeader
            icon={MapPin}
            title="Territory"
            description="Regional deployment and officer assignments"
          />
          {form.teritories.map((ter, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Region">
                <Input
                  value={ter.region}
                  onChange={(e) => updateTerritory(i, "region", e.target.value)}
                  placeholder="e.g. Lagos"
                />
              </Field>
              <Field label="Zone">
                <Input
                  value={ter.zone}
                  onChange={(e) => updateTerritory(i, "zone", e.target.value)}
                  placeholder="e.g. Ikorodu"
                />
              </Field>
              {(
                [
                  {
                    key: "ops_officer_in_charge",
                    label: "Ops Officer In Charge",
                  },
                  { key: "responsible_staff", label: "Responsible Staff" },
                  { key: "hod_in_charge", label: "HOD In Charge" },
                  { key: "operations_manager", label: "Operations Manager" },
                  {
                    key: "credit_controller_region",
                    label: "Credit Controller",
                  },
                  {
                    key: "business_dev_manager",
                    label: "Business Dev. Manager",
                  },
                ] as { key: keyof Territory; label: string }[]
              ).map(({ key, label }) => (
                <Field key={key} label={label}>
                  {staffLoading ? (
                    <Spinner />
                  ) : (
                    <StaffCombobox
                      value={ter[key]}
                      onChange={(v) => updateTerritory(i, key, v)}
                      options={staffOptions}
                      placeholder={`Select ${label}…`}
                    />
                  )}
                </Field>
              ))}
            </div>
          ))}
        </div>

        {/* ══ 4 · Service ═════════════════════════════════════════════════════ */}
        <div className="rounded-lg border bg-card p-6">
          <SectionHeader
            icon={Users}
            title="Service"
            description="Grade, shift pattern and quantity"
          />
          {form.service.map((svc, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Grade">
                {servicesLoading ? (
                  <Spinner />
                ) : (
                  <StaffCombobox
                    value={svc.grade}
                    onChange={(v) => updateService(i, "grade", v)}
                    options={serviceGradeOptions}
                    placeholder="Select grade…"
                  />
                )}
              </Field>
              <Field label="Shift Pattern">
                <Select
                  value={svc.shift_pattern}
                  onValueChange={(v) => updateService(i, "shift_pattern", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12hrs">12 Hours</SelectItem>
                    <SelectItem value="24hrs">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Quantity">
                <Input
                  type="number"
                  min="1"
                  value={svc.quantity}
                  onChange={(e) => updateService(i, "quantity", e.target.value)}
                  placeholder="2"
                />
              </Field>
            </div>
          ))}
        </div>

        {/* ══ 5 · Equipment ═══════════════════════════════════════════════════ */}
        {/* device is always "14" — not rendered, forced at submit */}
        <div className="rounded-lg border bg-card p-6">
          <SectionHeader
            icon={Wrench}
            title="Equipment"
            description="Costs and quantities"
          />
          {form.equipment.map((eq, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Cost (₦)">
                <Input
                  type="number"
                  value={eq.cost}
                  onChange={(e) => updateEquipment(i, "cost", e.target.value)}
                  placeholder="100"
                />
              </Field>
              <Field label="Monthly Service Cost (₦)">
                <Input
                  type="number"
                  value={eq.monthly_service_cost}
                  onChange={(e) =>
                    updateEquipment(i, "monthly_service_cost", e.target.value)
                  }
                  placeholder="100"
                />
              </Field>
              <Field label="Quantity">
                <Input
                  type="number"
                  value={eq.quantity}
                  onChange={(e) =>
                    updateEquipment(i, "quantity", e.target.value)
                  }
                  placeholder="10"
                />
              </Field>
            </div>
          ))}
        </div>

        {/* ══ 6 · Signatories ═════════════════════════════════════════════════ */}
        <div className="rounded-lg border bg-card p-6">
          <SectionHeader
            icon={Shield}
            title="Signatories"
            description="Authorised employees who will sign the contract"
          />
          <div className="space-y-6">
            {form.signatories.map((sig, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-6" />}
                <div className="flex items-center justify-between mb-4">
                  <Badge
                    variant="outline"
                    className="border-[#FAB435]/30 text-[#FAB435] text-[10px] tracking-widest"
                  >
                    {sig.role || `SIGNATORY ${i + 1}`}
                  </Badge>
                  {i > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          signatories: p.signatories.filter(
                            (_, idx) => idx !== i,
                          ),
                        }))
                      }
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Role">
                    <Input
                      value={sig.role}
                      onChange={(e) =>
                        updateSignatory(i, "role", e.target.value)
                      }
                      placeholder="BUSINESS DEV. MANAGER"
                    />
                  </Field>
                  <Field label="Employee">
                    {staffLoading ? (
                      <Spinner />
                    ) : (
                      <StaffCombobox
                        value={sig.employee_id}
                        onChange={(v) => updateSignatory(i, "employee_id", v)}
                        options={staffOptions}
                        placeholder="Select employee…"
                      />
                    )}
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                signatories: [...p.signatories, { role: "", employee_id: "" }],
              }))
            }
            className="mt-5 flex items-center gap-2 text-sm text-[#FAB435] hover:text-[#DC9E2E] font-medium transition-colors"
          >
            <span className="w-5 h-5 rounded-full border border-[#FAB435] flex items-center justify-center text-xs leading-none">
              +
            </span>
            Add Signatory
          </button>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-10">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#FAB435]/30 hover:bg-[#E89500] hover:text-white text-[#E89500] px-8 gap-2 font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Retainership"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRetainershipForm;
