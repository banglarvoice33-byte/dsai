CREATE TABLE `search_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`normalizedTerm` varchar(160) NOT NULL,
	`source` varchar(32) NOT NULL DEFAULT 'homepage',
	`searchCount` int NOT NULL DEFAULT 0,
	`lastSearchedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `search_analytics_id` PRIMARY KEY(`id`),
	CONSTRAINT `search_analytics_term_source_unique` UNIQUE(`normalizedTerm`,`source`)
);
