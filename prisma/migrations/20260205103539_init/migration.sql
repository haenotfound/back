-- CreateTable
CREATE TABLE `tbl_member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberEmail` VARCHAR(191) NOT NULL,
    `memberName` VARCHAR(191) NOT NULL,
    `memberAge` INTEGER NULL,
    `memberAddress` VARCHAR(191) NULL,
    `memberProfile` VARCHAR(191) NULL,
    `memberCreateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tbl_member_memberEmail_key`(`memberEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_auth_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberProvider` ENUM('LOCAL', 'GOOGLE', 'KAKAO', 'NAVER') NOT NULL,
    `memberProviderId` VARCHAR(191) NULL,
    `memberPassword` VARCHAR(191) NULL,
    `memberId` INTEGER NOT NULL,

    UNIQUE INDEX `tbl_auth_account_memberProviderId_memberId_key`(`memberProviderId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_auth_account` ADD CONSTRAINT `tbl_auth_account_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `tbl_member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
