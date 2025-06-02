-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userPhone" TEXT,
ALTER COLUMN "status" SET DEFAULT 'WAITING';

-- CreateIndex
CREATE INDEX "chat_sessions_category_priority_idx" ON "chat_sessions"("category", "priority");
