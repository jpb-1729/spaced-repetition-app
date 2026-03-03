-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "referenceText" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "expires" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "verification_tokens" ALTER COLUMN "expires" SET DATA TYPE TIMESTAMPTZ;

-- AddForeignKey
ALTER TABLE "DeckProgress" ADD CONSTRAINT "DeckProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
