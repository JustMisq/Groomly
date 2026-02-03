-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isFlexible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxDuration" INTEGER,
ADD COLUMN     "maxPrice" DOUBLE PRECISION,
ADD COLUMN     "minDuration" INTEGER,
ADD COLUMN     "minPrice" DOUBLE PRECISION;
