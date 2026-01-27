CREATE TABLE `face_pool` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`nationality` enum('korea','japan') NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`style` varchar(50) NOT NULL,
	`faceType` enum('cat','dog','horse','rabbit'),
	`embedding` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`version` varchar(20) NOT NULL DEFAULT 'v1',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `face_pool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `model_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelName` varchar(100) NOT NULL,
	`version` varchar(50) NOT NULL,
	`hairSSIM` decimal(5,4),
	`hairLPIPS` decimal(5,4),
	`hairDeltaE` decimal(4,2),
	`ringColorJump` decimal(4,2),
	`landmarkStability` decimal(4,3),
	`faceCollapseRate` decimal(4,3),
	`failureRate` decimal(4,3),
	`avgLatency` int,
	`costPerRequest` decimal(6,4),
	`grade` enum('S','A','B','F') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`testedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `model_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalImageUrl` varchar(500) NOT NULL,
	`resultImageUrl` varchar(500),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`nationality` enum('korea','japan') NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`style` varchar(50) NOT NULL,
	`selectedFaceId` int,
	`processingTime` int,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('free','premium','expired') NOT NULL DEFAULT 'free',
	`platform` enum('google','apple') NOT NULL,
	`transactionId` varchar(255),
	`productId` varchar(100),
	`purchaseDate` timestamp,
	`expiryDate` timestamp,
	`autoRenew` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`action` enum('upload','process','download','share') NOT NULL,
	`isPremium` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_logs_id` PRIMARY KEY(`id`)
);
