/*
  Warnings:

  - You are about to drop the column `community_comment_deleted_at` on the `tbl_community_comment` table. All the data in the column will be lost.
  - The primary key for the `tbl_member_recent_region` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `member_recent_region_id` on the `tbl_member_recent_region` table. All the data in the column will be lost.
  - You are about to drop the column `provide_post_deleted_at` on the `tbl_provide_post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberNickname]` on the table `member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `tbl_member_recent_region` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `tbl_provide_post_provide_post_deleted_at_idx` ON `tbl_provide_post`;

-- AlterTable
ALTER TABLE `tbl_community_comment` DROP COLUMN `community_comment_deleted_at`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `tbl_member_recent_region` DROP PRIMARY KEY,
    DROP COLUMN `member_recent_region_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `tbl_provide_post` DROP COLUMN `provide_post_deleted_at`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `member_memberNickname_key` ON `member`(`memberNickname`);

-- CreateIndex
CREATE INDEX `tbl_provide_post_deletedAt_idx` ON `tbl_provide_post`(`deletedAt`);
