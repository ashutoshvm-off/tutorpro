CREATE TABLE `lesson_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`tutorId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lesson_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorId` int NOT NULL,
	`studentId` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`state` enum('scheduled','in_progress','completed','ai_reviewed') NOT NULL DEFAULT 'scheduled',
	`topic` varchar(240) NOT NULL,
	`liveNotes` text DEFAULT (''),
	`homework` text DEFAULT (''),
	`aiPlan` json,
	`aiSummary` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutorflow_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('tutor','student') NOT NULL DEFAULT 'student',
	`fullName` varchar(240) NOT NULL,
	`avatarUrl` text,
	`address` text,
	`classGrade` varchar(120),
	`schoolCollege` varchar(240),
	`learningGoals` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutorflow_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `tutorflow_profiles_userId_unique` UNIQUE(`userId`)
);
