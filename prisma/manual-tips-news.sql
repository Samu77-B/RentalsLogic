-- Tips & news tables for landlord dashboard content (run in Neon if db push is unavailable)

DO $$ BEGIN
  CREATE TYPE "NewsCategory" AS ENUM ('LANDLORD_LAW', 'TENANT_LAW', 'UK_NEWS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "LandlordTip" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "category" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "authorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "LandlordTip_published_sortOrder_idx"
  ON "LandlordTip"("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "LandlordTip_createdAt_idx"
  ON "LandlordTip"("createdAt");

CREATE TABLE IF NOT EXISTS "NewsArticle" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "body" TEXT,
  "category" "NewsCategory" NOT NULL DEFAULT 'UK_NEWS',
  "sourceName" TEXT,
  "sourceUrl" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "authorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "NewsArticle_published_publishedAt_idx"
  ON "NewsArticle"("published", "publishedAt");
CREATE INDEX IF NOT EXISTS "NewsArticle_category_idx"
  ON "NewsArticle"("category");
