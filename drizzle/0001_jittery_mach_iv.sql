CREATE TABLE `integration_connectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`label` varchar(160) NOT NULL,
	`category` enum('messaging','calendar','crm','media','analytics') NOT NULL,
	`enabled` tinyint NOT NULL DEFAULT 0,
	`status` enum('disabled','ready','degraded','error') NOT NULL DEFAULT 'disabled',
	`lastCheckedAt` timestamp,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_connectors_id` PRIMARY KEY(`id`),
	CONSTRAINT `integration_connectors_slug_unique` UNIQUE(`slug`)
);
