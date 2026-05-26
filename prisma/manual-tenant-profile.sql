-- Run in Supabase → SQL Editor if `npm run db:push` cannot reach the database.
-- Safe to re-run: uses IF NOT EXISTS / DO blocks where possible.

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'ID_VERIFICATION';

ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "previousAddress" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "idDocumentType" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "idDocumentNumber" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "idDocumentUrl" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "nationality" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "employmentStatus" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "employer" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "emergencyContactPhone" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "emergencyContactRelation" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "rightToRentReference" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "previousLandlordRef" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "notes" TEXT;

CREATE TABLE IF NOT EXISTS "Guarantor" (
  "id" TEXT NOT NULL,
  "tenancyId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "address" TEXT,
  "occupation" TEXT,
  "employer" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "relationship" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Guarantor_tenancyId_idx" ON "Guarantor"("tenancyId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Guarantor_tenancyId_fkey'
  ) THEN
    ALTER TABLE "Guarantor"
      ADD CONSTRAINT "Guarantor_tenancyId_fkey"
      FOREIGN KEY ("tenancyId") REFERENCES "Tenancy"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "tenancyId" TEXT;

CREATE INDEX IF NOT EXISTS "Document_tenancyId_idx" ON "Document"("tenancyId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Document_tenancyId_fkey'
  ) THEN
    ALTER TABLE "Document"
      ADD CONSTRAINT "Document_tenancyId_fkey"
      FOREIGN KEY ("tenancyId") REFERENCES "Tenancy"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
