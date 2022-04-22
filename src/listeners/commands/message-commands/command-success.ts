import { ApplyOptions } from '@sapphire/decorators';
import type { Command, MessageCommandSuccessPayload } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import { blue, cyan, yellow } from 'colorette';
import type { Guild, User } from 'discord.js';

import { Config } from '#root/config';

@ApplyOptions<Listener.Options>({
	name: 'MessageCommandSuccess',
	event: Events.MessageCommandSuccess,
	enabled: Config.isDebug
})
export class MessageCommandSuccess extends Listener<typeof Events.MessageCommandSuccess> {
	public run({ message, command }: MessageCommandSuccessPayload) {
		const shard = this.shard(message.guild?.shardId ?? 0);
		const commandName = this.command(command);
		const author = this.author(message.author);
		this.logger.debug(`${shard} » ${this.guild(message.guild!)} » ${author} » ${commandName}`);
	}

	private shard(id: number) {
		return `${blue(`SHARD[${id.toString()}]`)}`;
	}

	private command(command: Command) {
		return cyan(`${command.name} [Message]`);
	}

	private author(author: User) {
		return `${author.username}(${yellow(author.id)})`;
	}

	private guild(guild: Guild) {
		return `${guild.name}(${cyan(guild.id)})`;
	}
}
