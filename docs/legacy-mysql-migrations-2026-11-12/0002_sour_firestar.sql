CREATE TABLE `changelog_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(40) NOT NULL,
	`title` varchar(180) NOT NULL,
	`summary` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`category` enum('feature','improvement','security','guide') NOT NULL DEFAULT 'feature',
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `changelog_entries_id` PRIMARY KEY(`id`)
);
