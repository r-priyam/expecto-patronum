import { time, TimestampStyles } from '@discordjs/builders';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { TimerManager } from '@sapphire/time-utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';

import { resolveOnErrorCodes } from '#utils/util';

export class ReminderTask extends ScheduledTask {
	public async run(payload: ReminderPayload) {
		const user = await resolveOnErrorCodes(this.container.client.users.fetch(payload.userId), RESTJSONErrorCodes.UnknownUser);

		if (user) {
			const reminderCreatedAt = time(new Date(payload.createdAt), TimestampStyles.RelativeTime);
			await resolveOnErrorCodes(
				//
				user.send(`Hey <@${user.id}>! ${reminderCreatedAt}, you asked me to remind for **${payload.message}**`),
				RESTJSONErrorCodes.CannotSendMessagesToThisUser
			);
		}

		await this.sql`DELETE
					   FROM reminders
					   WHERE id = ${payload.id}`;
	}

	public override async onLoad() {
		// Check per 1 second if client is ready or not.
		// sending message when bot isn't ready will error
		if (this.client.isReady()) {
			await this.checkMissedReminders();
			return;
		}

		TimerManager.setTimeout(async () => {
			await this.onLoad();
		}, 1000);
	}

	private async checkMissedReminders() {
		// If bot goes offline, i.e. for maintenance or whatsoever then it may miss the
		// scheduled reminders by few seconds so check for pending reminders here whenever
		// bot starts and dispatch them.
		const pending = await this.sql<RawReminderPayload[]>`SELECT id, user_id, message, created_at
															 FROM reminders
															 WHERE expires_at < NOW()
															 ORDER BY expires_at`;
		if (pending.length > 0) {
			for (const reminder of pending) {
				await this.run({
					id: reminder.id,
					userId: reminder.userId,
					message: reminder.message,
					createdAt: reminder.createdAt
				});
			}
		}
	}
}

interface RawReminderPayload {
	id: number;
	userId: string;
	message: string;
	createdAt: string;
}

interface ReminderPayload {
	id: number;
	userId: string;
	message: string;
	createdAt: string;
}
