CREATE TABLE `access_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`workflow` enum('document','government','healthcare','jobs','legal','billing') NOT NULL,
	`language` varchar(16) NOT NULL DEFAULT 'bn',
	`riskLevel` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('draft','review','ready','closed') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `access_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creative_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`tier` enum('free','pro','creator') NOT NULL DEFAULT 'free',
	`status` enum('queued','processing','complete','failed') NOT NULL DEFAULT 'queued',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creative_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `waitlist_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`interest` enum('access','creative','both') NOT NULL DEFAULT 'both',
	`language` varchar(16) NOT NULL DEFAULT 'bn',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_signups_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_signups_email_unique` UNIQUE(`email`)
);
