/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `advisories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdvisoryType" AS ENUM ('standard', 'poster');

-- AlterTable
ALTER TABLE "advisories" ADD COLUMN     "affectedProducts" TEXT[],
ADD COLUMN     "impact" TEXT,
ADD COLUMN     "overview" TEXT,
ADD COLUMN     "recommendedActions" TEXT[],
ADD COLUMN     "references" TEXT[],
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "type" "AdvisoryType" NOT NULL DEFAULT 'standard';

-- CreateTable
CREATE TABLE "poster_items" (
    "id" TEXT NOT NULL,
    "advisoryId" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poster_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poster_items_advisoryId_idx" ON "poster_items"("advisoryId");

-- CreateIndex
CREATE UNIQUE INDEX "advisories_slug_key" ON "advisories"("slug");

-- AddForeignKey
ALTER TABLE "poster_items" ADD CONSTRAINT "poster_items_advisoryId_fkey" FOREIGN KEY ("advisoryId") REFERENCES "advisories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
