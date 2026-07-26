-- Add property cover photo support (run in Neon SQL editor if db push is unavailable)
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "coverPhotoUrl" TEXT;
