CREATE TABLE `file_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`byteSize` int NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`scanStatus` enum('quarantined','scanning','clean','infected','error','expired') NOT NULL DEFAULT 'quarantined',
	`scanProvider` varchar(80),
	`scanMessage` varchar(500),
	`retentionExpiresAt` timestamp NOT NULL,
	`scannedAt` timestamp,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `file_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `file_assets_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE INDEX `file_assets_user_status_idx` ON `file_assets` (`userId`,`scanStatus`);--> statement-breakpoint
CREATE INDEX `file_assets_retention_idx` ON `file_assets` (`retentionExpiresAt`,`scanStatus`);