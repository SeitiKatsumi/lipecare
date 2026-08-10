UPDATE "SymptomRecord" SET "externalId" = "id" WHERE "externalId" IS NULL;
UPDATE "BodyMeasurement" SET "externalId" = "id" WHERE "externalId" IS NULL;

ALTER TABLE "SymptomRecord" ALTER COLUMN "externalId" SET NOT NULL;
ALTER TABLE "BodyMeasurement" ALTER COLUMN "externalId" SET NOT NULL;
