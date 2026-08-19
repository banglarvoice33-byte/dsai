CREATE TABLE `work_packet_audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`packetId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('created','source_added','drafted','submitted_for_review','approved','changes_requested','rejected','exported','deleted') NOT NULL,
	`reason` varchar(1000),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `work_packet_audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_packet_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`packetId` int NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('file','url','note') NOT NULL,
	`label` varchar(180) NOT NULL,
	`reference` varchar(1000),
	`evidenceText` text,
	`citationState` enum('unreviewed','supported','uncertain','rejected') NOT NULL DEFAULT 'unreviewed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `work_packet_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_packets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`language` varchar(16) NOT NULL DEFAULT 'bn',
	`status` enum('draft','review','approved','changes_requested','rejected','archived') NOT NULL DEFAULT 'draft',
	`uncertainty` text,
	`nextAction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_packets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `file_assets` ADD `packetId` int;--> statement-breakpoint
CREATE INDEX `work_packet_audit_packet_idx` ON `work_packet_audit_events` (`packetId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `work_packet_sources_packet_idx` ON `work_packet_sources` (`packetId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `work_packets_user_status_idx` ON `work_packets` (`userId`,`status`);