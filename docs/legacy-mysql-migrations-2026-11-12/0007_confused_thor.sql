CREATE TABLE `agent_traces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`traceKey` varchar(96) NOT NULL,
	`agentId` varchar(80) NOT NULL,
	`agentName` varchar(120) NOT NULL,
	`department` varchar(160) NOT NULL,
	`status` enum('queued','running','paused_for_approval','completed','failed') NOT NULL,
	`providerMode` enum('mock','provider-gated','local') NOT NULL,
	`requestLabel` varchar(240) NOT NULL,
	`evidenceCount` int NOT NULL DEFAULT 0,
	`approvalRequired` tinyint NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL,
	`endedAt` timestamp,
	`steps` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_traces_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_traces_user_key_unique` UNIQUE(`userId`,`traceKey`)
);
--> statement-breakpoint
CREATE TABLE `benchmark_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`suiteVersion` varchar(40) NOT NULL,
	`language` varchar(16) NOT NULL DEFAULT 'bn',
	`status` enum('passed','failed','blocked') NOT NULL,
	`scoreBps` int NOT NULL,
	`sampleCount` int NOT NULL DEFAULT 0,
	`resultJson` text NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `benchmark_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_test_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(80) NOT NULL,
	`scenario` varchar(80) NOT NULL,
	`outcome` enum('passed','failed','blocked') NOT NULL,
	`scopes` varchar(1000) NOT NULL,
	`detail` varchar(1000) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauth_test_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`module` varchar(120) NOT NULL,
	`route` varchar(160) NOT NULL,
	`p50Ms` int NOT NULL,
	`p95Ms` int NOT NULL,
	`errorRateBps` int NOT NULL DEFAULT 0,
	`sampleCount` int NOT NULL DEFAULT 0,
	`source` enum('lab','field','synthetic') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `release_gate_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` enum('quality','security','performance','provider','operations') NOT NULL,
	`status` enum('pending','pass','fail','waived') NOT NULL,
	`thresholdLabel` varchar(180) NOT NULL,
	`observedLabel` varchar(180) NOT NULL,
	`details` varchar(1000) NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `release_gate_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `agent_traces_owner_created_idx` ON `agent_traces` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `oauth_test_runs_owner_created_idx` ON `oauth_test_runs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `performance_snapshots_module_created_idx` ON `performance_snapshots` (`module`,`createdAt`);