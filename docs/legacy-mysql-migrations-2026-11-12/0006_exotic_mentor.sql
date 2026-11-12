CREATE TABLE `student_pro_entitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`applicationId` int NOT NULL,
	`plan` enum('pro') NOT NULL DEFAULT 'pro',
	`status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
	`dailyLimit` int NOT NULL DEFAULT 20,
	`monthlyLimit` int NOT NULL DEFAULT 300,
	`startsAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_pro_entitlements_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_pro_entitlements_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `student_pro_entitlements_applicationId_unique` UNIQUE(`applicationId`)
);
--> statement-breakpoint
CREATE TABLE `student_pro_usage_counters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entitlementId` int NOT NULL,
	`period` enum('day','month') NOT NULL,
	`periodStart` timestamp NOT NULL,
	`units` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_pro_usage_counters_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_pro_usage_unique` UNIQUE(`userId`,`entitlementId`,`period`,`periodStart`)
);
--> statement-breakpoint
CREATE TABLE `student_scholarship_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(16) NOT NULL DEFAULT 'bn',
	`country` varchar(80) NOT NULL,
	`institution` varchar(180) NOT NULL,
	`verificationMethod` enum('institutional_email','manual_review','provider_assertion') NOT NULL DEFAULT 'manual_review',
	`evidenceReferenceHash` varchar(128),
	`ageAttested18Plus` tinyint NOT NULL DEFAULT 0,
	`status` enum('pending','in_review','approved','rejected','withdrawn') NOT NULL DEFAULT 'pending',
	`reviewerId` int,
	`reviewerNote` varchar(1000),
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_scholarship_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_scholarship_applications_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `student_scholarship_programs` (
	`id` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`maxSeats` int NOT NULL DEFAULT 100,
	`approvedSeats` int NOT NULL DEFAULT 0,
	`active` tinyint NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_scholarship_programs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `student_pro_expiry_idx` ON `student_pro_entitlements` (`status`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `student_scholarship_status_idx` ON `student_scholarship_applications` (`status`,`createdAt`);