-- DropIndex
DROP INDEX "need_zones_location_gist_idx";

-- DropIndex
DROP INDEX "outlets_location_gist_idx";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "slaDeadlineAt" TIMESTAMP(3),
ADD COLUMN     "slaWarningSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "transactions_slaDeadlineAt_idx" ON "transactions"("slaDeadlineAt");
