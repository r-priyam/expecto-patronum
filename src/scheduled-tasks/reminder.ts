import { time, TimestampStyles } from '@discordjs/builders';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
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

		await this.sql`DELETE FROM reminders WHERE id = ${payload.id}`;
	}
}

interface ReminderPayload {
	id: number;
	userId: string;
	message: string;
	createdAt: string;
}
