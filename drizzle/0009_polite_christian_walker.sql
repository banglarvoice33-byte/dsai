CREATE TABLE `alpha_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('referral','reward','system') NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` varchar(500) NOT NULL,
	`referenceId` int,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alpha_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `alpha_notification_user_idx` ON `alpha_notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `alpha_notification_created_idx` ON `alpha_notifications` (`createdAt`);