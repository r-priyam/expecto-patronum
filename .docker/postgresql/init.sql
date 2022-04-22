CREATE EXTENSION pg_trgm;

CREATE TABLE "public"."reminders" {
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"guild_id" TEXT NOT NULL,
	"channel_id" TEXT NOT NULL,
	"message_id" TEXT NOT NULL,
	"message" TEXT NOT NULL,
	"created" NOW() AT TIME ZONE 'UTC' NOT NULL,
	"expires" TIMESTAMP WITH TIME ZONE NOT NULL
}

CREATE INDEX idx_reminders_expires ON "public"."reminders" USING BTREE ("expires" ASC);
