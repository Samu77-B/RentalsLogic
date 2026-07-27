-- Tenant communication preferences (run in Neon if db push is unavailable)

CREATE TABLE IF NOT EXISTS "TenantProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "phone" TEXT,
  "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
  "notifyWhatsApp" BOOLEAN NOT NULL DEFAULT false,
  "notifyTelegram" BOOLEAN NOT NULL DEFAULT false,
  "whatsappNumber" TEXT,
  "telegramHandle" TEXT,
  "notifyMaintenance" BOOLEAN NOT NULL DEFAULT true,
  "notifyInspections" BOOLEAN NOT NULL DEFAULT true,
  "notifyDocuments" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TenantProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TenantProfile_userId_key" ON "TenantProfile"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TenantProfile_userId_fkey'
  ) THEN
    ALTER TABLE "TenantProfile"
      ADD CONSTRAINT "TenantProfile_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "notifyEmail" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "notifyWhatsApp" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "notifyTelegram" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "telegramHandle" TEXT;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "notifyMaintenance" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "notifyInspections" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "notifyDocuments" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "TenantProfile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
