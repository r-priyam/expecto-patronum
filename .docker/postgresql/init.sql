CREATE EXTENSION pg_trgm;

SET TIME ZONE 'UTC';

CREATE TABLE public.reminders
(
    id         SERIAL PRIMARY KEY,
    user_id    TEXT                     NOT NULL,
    message    TEXT                     NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_reminders_expires ON reminders USING BTREE (expires ASC);

COMMENT ON COLUMN public.reminders.id IS 'The unique identifier for the reminder.';
COMMENT ON COLUMN public.reminders.user_id IS 'The user ID of the user who created the reminder.';
COMMENT ON COLUMN public.reminders.message IS 'The message to be sent to the user.';
COMMENT ON COLUMN public.reminders.created IS 'The date and time the reminder was created.';
COMMENT ON COLUMN public.reminders.expires IS 'The date and time the reminder expires.';
