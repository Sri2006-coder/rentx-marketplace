-- AlterTable
ALTER TABLE "TrustProfile" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
