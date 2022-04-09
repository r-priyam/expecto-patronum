import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: 'MentionPrefix',
	event: Events.MentionPrefixOnly
})
export class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
	public async run(message: Message) {
		const prefix = this.client.options.defaultPrefix;
		return message.channel.send(`My prefix in this guild is: \`${prefix}\``);
	}
}
