export interface GuarantorInput {
  fullName: string;
  address?: string;
  occupation?: string;
  employer?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface TenancyProfileInput {
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  previousAddress?: string;
  dateOfBirth?: string | null;
  photoUrl?: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  idDocumentUrl?: string;
  nationality?: string;
  employmentStatus?: string;
  employer?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  rightToRentReference?: string;
  previousLandlordRef?: string;
  notes?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  guarantors?: GuarantorInput[];
}

export function tenancyProfileData(body: TenancyProfileInput) {
  return {
    tenantName: body.tenantName,
    tenantEmail: body.tenantEmail,
    tenantPhone: body.tenantPhone || null,
    previousAddress: body.previousAddress || null,
    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : body.dateOfBirth === null ? null : undefined,
    photoUrl: body.photoUrl || null,
    idDocumentType: body.idDocumentType || null,
    idDocumentNumber: body.idDocumentNumber || null,
    idDocumentUrl: body.idDocumentUrl || null,
    nationality: body.nationality || null,
    employmentStatus: body.employmentStatus || null,
    employer: body.employer || null,
    emergencyContactName: body.emergencyContactName || null,
    emergencyContactPhone: body.emergencyContactPhone || null,
    emergencyContactRelation: body.emergencyContactRelation || null,
    rightToRentReference: body.rightToRentReference || null,
    previousLandlordRef: body.previousLandlordRef || null,
    notes: body.notes || null,
    leaseStartDate: body.leaseStartDate ? new Date(body.leaseStartDate) : undefined,
    leaseEndDate: body.leaseEndDate ? new Date(body.leaseEndDate) : undefined,
  };
}

export const tenancyInclude = {
  guarantors: { orderBy: { createdAt: "asc" as const } },
  documents: {
    where: { documentType: "LEASE" as const },
    include: { signatures: true },
    orderBy: { createdAt: "desc" as const },
  },
  property: { select: { id: true, address: true, city: true } },
  tenant: { select: { id: true, email: true, fullName: true } },
};
