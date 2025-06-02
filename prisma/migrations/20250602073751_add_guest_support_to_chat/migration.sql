-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "guestFirstName" TEXT,
ADD COLUMN     "guestLastName" TEXT,
ADD COLUMN     "isGuest" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "chat_sessions_isGuest_status_idx" ON "chat_sessions"("isGuest", "status");
