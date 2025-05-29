/*
  Warnings:

  - You are about to drop the column `action` on the `user_activities` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `user_activities` table. All the data in the column will be lost.
  - Added the required column `element` to the `user_activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_activities_action_createdAt_idx";

-- AlterTable
ALTER TABLE "user_activities" DROP COLUMN "action",
DROP COLUMN "details",
ADD COLUMN     "element" TEXT NOT NULL,
ADD COLUMN     "from" JSONB,
ADD COLUMN     "to" JSONB,
ADD COLUMN     "typeLog" TEXT;
