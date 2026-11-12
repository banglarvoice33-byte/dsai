CREATE TABLE `billing_webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(64) NOT NULL,
	`eventId` varchar(160) NOT NULL,
	`eventType` varchar(160) NOT NULL,
	`signatureVerified` tinyint NOT NULL DEFAULT 0,
	`status` enum('received','processed','ignored','failed','blocked') NOT NULL DEFAULT 'received',
	`requestId` varchar(128),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `billing_webhook_provider_event_unique` UNIQUE(`provider`,`eventId`)
);
--> statement-breakpoint
CREATE TABLE `data_lifecycle_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`subjectType` varchar(64) NOT NULL,
	`subjectId` varchar(128) NOT NULL,
	`action` enum('retention_scheduled','retention_expired','deletion_requested','deletion_verified','deletion_failed','tombstone_written') NOT NULL,
	`outcome` enum('recorded','completed','failed','blocked') NOT NULL,
	`evidenceHash` varchar(128),
	`requestId` varchar(128),
	`details` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_lifecycle_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `billing_webhook_status_created_idx` ON `billing_webhook_events` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `data_lifecycle_subject_idx` ON `data_lifecycle_events` (`subjectType`,`subjectId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `data_lifecycle_user_idx` ON `data_lifecycle_events` (`userId`,`createdAt`);