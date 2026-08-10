-- CreateEnum
CREATE TYPE "ClinicalSummaryStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "ClinicalAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ClinicalAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "clinicalInitializedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Patient"
ADD COLUMN "age" INTEGER,
ADD COLUMN "email" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Avaliação pendente',
ADD COLUMN "lastCheckInAt" TIMESTAMP(3),
ADD COLUMN "clinicalSummary" TEXT;

-- AlterTable
ALTER TABLE "SymptomRecord" ADD COLUMN "externalId" TEXT;
UPDATE "SymptomRecord" SET "externalId" = "id" WHERE "externalId" IS NULL;

-- AlterTable
ALTER TABLE "BodyMeasurement"
ADD COLUMN "externalId" TEXT,
ADD COLUMN "thighCm" DECIMAL(65,30),
ADD COLUMN "legCm" DECIMAL(65,30);
UPDATE "BodyMeasurement" SET "externalId" = "id" WHERE "externalId" IS NULL;

-- CreateTable
CREATE TABLE "ConversationMessage" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "authorUserId" TEXT,
  "authorName" TEXT,
  "text" TEXT NOT NULL,
  "attachments" JSONB NOT NULL,
  "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
  "fallback" BOOLEAN NOT NULL DEFAULT false,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckInRecord" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "frequency" TEXT,
  "answers" JSONB NOT NULL,
  "summary" TEXT,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CheckInRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalMemory" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "shortTermSummary" TEXT NOT NULL,
  "structured" JSONB NOT NULL,
  "unresolvedQuestions" JSONB NOT NULL,
  "activePlan" JSONB NOT NULL,
  "engagement" INTEGER,
  "lastSituation" TEXT,
  "frequency" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalSummary" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "narrative" TEXT NOT NULL,
  "structured" JSONB NOT NULL,
  "sourceReferences" JSONB NOT NULL,
  "status" "ClinicalSummaryStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "editedByUserId" TEXT,
  "reviewedByUserId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalAlert" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "severity" "ClinicalAlertSeverity" NOT NULL,
  "status" "ClinicalAlertStatus" NOT NULL DEFAULT 'OPEN',
  "title" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "reviewedByUserId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalTask" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "priority" TEXT,
  "dueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicalTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SymptomRecord_tenantId_externalId_key" ON "SymptomRecord"("tenantId", "externalId");
CREATE UNIQUE INDEX "BodyMeasurement_tenantId_externalId_key" ON "BodyMeasurement"("tenantId", "externalId");
CREATE UNIQUE INDEX "ConversationMessage_tenantId_externalId_key" ON "ConversationMessage"("tenantId", "externalId");
CREATE INDEX "ConversationMessage_tenantId_patientId_sentAt_idx" ON "ConversationMessage"("tenantId", "patientId", "sentAt");
CREATE UNIQUE INDEX "CheckInRecord_tenantId_externalId_key" ON "CheckInRecord"("tenantId", "externalId");
CREATE INDEX "CheckInRecord_tenantId_patientId_recordedAt_idx" ON "CheckInRecord"("tenantId", "patientId", "recordedAt");
CREATE UNIQUE INDEX "ClinicalMemory_patientId_key" ON "ClinicalMemory"("patientId");
CREATE INDEX "ClinicalMemory_tenantId_updatedAt_idx" ON "ClinicalMemory"("tenantId", "updatedAt");
CREATE UNIQUE INDEX "ClinicalSummary_patientId_key" ON "ClinicalSummary"("patientId");
CREATE INDEX "ClinicalSummary_tenantId_status_updatedAt_idx" ON "ClinicalSummary"("tenantId", "status", "updatedAt");
CREATE UNIQUE INDEX "ClinicalAlert_tenantId_sourceKey_key" ON "ClinicalAlert"("tenantId", "sourceKey");
CREATE INDEX "ClinicalAlert_tenantId_patientId_status_detectedAt_idx" ON "ClinicalAlert"("tenantId", "patientId", "status", "detectedAt");
CREATE UNIQUE INDEX "ClinicalTask_tenantId_externalId_key" ON "ClinicalTask"("tenantId", "externalId");
CREATE INDEX "ClinicalTask_tenantId_patientId_status_dueAt_idx" ON "ClinicalTask"("tenantId", "patientId", "status", "dueAt");

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CheckInRecord" ADD CONSTRAINT "CheckInRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalMemory" ADD CONSTRAINT "ClinicalMemory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalMemory" ADD CONSTRAINT "ClinicalMemory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalSummary" ADD CONSTRAINT "ClinicalSummary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalSummary" ADD CONSTRAINT "ClinicalSummary_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalAlert" ADD CONSTRAINT "ClinicalAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalAlert" ADD CONSTRAINT "ClinicalAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalTask" ADD CONSTRAINT "ClinicalTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalTask" ADD CONSTRAINT "ClinicalTask_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
