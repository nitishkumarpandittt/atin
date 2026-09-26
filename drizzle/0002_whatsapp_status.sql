ALTER TABLE `enquiries` ADD `whatsapp_status` varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `whatsapp_error` varchar(500);