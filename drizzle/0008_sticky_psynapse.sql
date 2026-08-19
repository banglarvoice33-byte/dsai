CREATE TABLE `alpha_contribution_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('packet_created','source_added','submitted_for_review','approved') NOT NULL,
	`points` int NOT NULL,
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alpha_contribution_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alpha_referral_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerUserId` int NOT NULL,
	`referredUserId` int,
	`code` varchar(80) NOT NULL,
	`status` enum('pending','qualified','rewarded','reversed') NOT NULL DEFAULT 'pending',
	`points` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alpha_referral_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alpha_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(80) NOT NULL,
	`label` varchar(180) NOT NULL,
	`pointsCost` int NOT NULL,
	`status` enum('available','claimed','expired') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`claimedAt` timestamp,
	CONSTRAINT `alpha_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(120),
	`bio` varchar(500),
	`preferredLanguage` varchar(16) NOT NULL DEFAULT 'bn',
	`themePreference` enum('system','light','dark') NOT NULL DEFAULT 'system',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `alpha_contribution_user_idx` ON `alpha_contribution_events` (`userId`);--> statement-breakpoint
CREATE INDEX `alpha_contribution_created_idx` ON `alpha_contribution_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `alpha_referral_referrer_idx` ON `alpha_referral_events` (`referrerUserId`);--> statement-breakpoint
CREATE INDEX `alpha_referral_code_idx` ON `alpha_referral_events` (`code`);--> statement-breakpoint
CREATE INDEX `alpha_reward_user_idx` ON `alpha_rewards` (`userId`);