export const ID_DOCUMENT_TYPES = [
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENCE", label: "Driving licence" },
  { value: "BRP", label: "Biometric residence permit (BRP)" },
  { value: "NATIONAL_ID", label: "National ID card" },
  { value: "OTHER", label: "Other" },
];

export const EMPLOYMENT_STATUSES = [
  { value: "EMPLOYED", label: "Employed" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "STUDENT", label: "Student" },
  { value: "RETIRED", label: "Retired" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "OTHER", label: "Other" },
];

export const emptyGuarantor = () => ({
  fullName: "",
  address: "",
  occupation: "",
  employer: "",
  email: "",
  phone: "",
  relationship: "",
});

export const emptyTenantForm = () => ({
  tenantName: "",
  tenantEmail: "",
  tenantPhone: "",
  previousAddress: "",
  dateOfBirth: "",
  photoUrl: "",
  idDocumentType: "PASSPORT",
  idDocumentNumber: "",
  idDocumentUrl: "",
  nationality: "",
  employmentStatus: "EMPLOYED",
  employer: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  rightToRentReference: "",
  previousLandlordRef: "",
  notes: "",
  leaseStartDate: "",
  leaseEndDate: "",
  guarantors: [emptyGuarantor()],
  leaseContractUrl: "",
  leaseContractTitle: "Tenancy agreement",
});

export type TenantFormState = ReturnType<typeof emptyTenantForm>;

export type TenancyFormSource = Partial<
  Omit<TenantFormState, "leaseContractUrl" | "leaseContractTitle" | "guarantors">
> & {
  dateOfBirth?: string | Date | null;
  leaseStartDate?: string | Date | null;
  leaseEndDate?: string | Date | null;
  guarantors?: TenantFormState["guarantors"];
};

export function tenancyToForm(t: TenancyFormSource): TenantFormState {
  const guarantors = (t.guarantors as TenantFormState["guarantors"]) ?? [];
  return {
    tenantName: String(t.tenantName ?? ""),
    tenantEmail: String(t.tenantEmail ?? ""),
    tenantPhone: String(t.tenantPhone ?? ""),
    previousAddress: String(t.previousAddress ?? ""),
    dateOfBirth: t.dateOfBirth ? String(t.dateOfBirth).slice(0, 10) : "",
    photoUrl: String(t.photoUrl ?? ""),
    idDocumentType: String(t.idDocumentType ?? "PASSPORT"),
    idDocumentNumber: String(t.idDocumentNumber ?? ""),
    idDocumentUrl: String(t.idDocumentUrl ?? ""),
    nationality: String(t.nationality ?? ""),
    employmentStatus: String(t.employmentStatus ?? "EMPLOYED"),
    employer: String(t.employer ?? ""),
    emergencyContactName: String(t.emergencyContactName ?? ""),
    emergencyContactPhone: String(t.emergencyContactPhone ?? ""),
    emergencyContactRelation: String(t.emergencyContactRelation ?? ""),
    rightToRentReference: String(t.rightToRentReference ?? ""),
    previousLandlordRef: String(t.previousLandlordRef ?? ""),
    notes: String(t.notes ?? ""),
    leaseStartDate: t.leaseStartDate ? String(t.leaseStartDate).slice(0, 10) : "",
    leaseEndDate: t.leaseEndDate ? String(t.leaseEndDate).slice(0, 10) : "",
    guarantors: guarantors.length ? guarantors : [emptyGuarantor()],
    leaseContractUrl: "",
    leaseContractTitle: "Tenancy agreement",
  };
}

export function leaseStatus(tenancy: {
  documents?: Array<{ isSigned: boolean; title: string }>;
}) {
  const lease = tenancy.documents?.[0];
  if (!lease) return { label: "No contract", variant: "secondary" as const };
  if (lease.isSigned) return { label: "Contract signed", variant: "default" as const };
  return { label: "Awaiting signature", variant: "outline" as const };
}
