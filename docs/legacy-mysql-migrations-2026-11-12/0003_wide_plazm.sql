CREATE TABLE `deletion_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int,
	`scope` enum('account','all_data','question') NOT NULL DEFAULT 'account',
	`details` varchar(2000),
	`identityConfirmed` tinyint NOT NULL DEFAULT 0,
	`status` enum('pending','in_review','completed','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`operatorNote` varchar(2000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deletion_requests_id` PRIMARY KEY(`id`)
);
