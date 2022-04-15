import { ApplyOptions } from '@sapphire/decorators';
import type { Command, MessageCommandSuccessPayload } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import { blue, cyan, yellow } from 'colorette';
import type { Guild, User } from 'discord.js';

import { config } from '#root/config';

@ApplyOptions<Listener.Options>({
	name: 'MessageCommandSuccess',
	event: Events.MessageCommandSuccess,
	enabled: config.debug
})
export class UserEvent extends Listener<typeof Events.MessageCommandSuccess> {
	public run({ message, command }: MessageCommandSuccessPayload) {
		const shard = this.shard(message.guild?.shardId ?? 0);
		const commandName = this.command(command);
		const author = this.author(message.author);
		const sentAt = message.guild ? this.guild(message.guild) : this.direct();
		this.logger.debug(`${shard} » ${sentAt} » ${author} » ${commandName}`);
	}

	private shard(id: number) {
		return `${blue(`SHARD[${id.toString()}]`)}`;
	}

	private command(command: Command) {
		return cyan(command.name);
	}

	private author(author: User) {
		return `${author.username}(${yellow(author.id)})`;
	}

	private direct() {
		return cyan('Direct Messages');
	}

	private guild(guild: Guild) {
		return `${guild.name}(${cyan(guild.id)})`;
	}
}
