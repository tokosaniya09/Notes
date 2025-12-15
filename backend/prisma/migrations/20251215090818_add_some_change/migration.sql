/*
  Warnings:

  - You are about to drop the `note_versions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'past_due', 'incomplete', 'trialing');

-- DropForeignKey
ALTER TABLE "note_versions" DROP CONSTRAINT "note_versions_noteId_fkey";

-- DropIndex
DROP INDEX "notes_userId_idx";

-- AlterTable
ALTER TABLE "notes" ALTER COLUMN "title" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus",
ALTER COLUMN "preferences" DROP DEFAULT;

-- DropTable
DROP TABLE "note_versions";

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");
