import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand, ChatInputCommandSuccessPayload } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import { blue, cyan, yellow } from 'colorette';
import type { Guild, User } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: 'ChatInputCommandSuccess',
	event: Events.ChatInputCommandSuccess
})
export class ChatInputCommandSuccess extends Listener<typeof Events.ChatInputCommandSuccess> {
	public run({ interaction, command }: ChatInputCommandSuccessPayload) {
		const shard = this.shard(interaction.guild?.shardId ?? 0);
		const commandName = this.command(command);
		const author = this.author(interaction.user);
		this.logger.debug(`${shard} » ${this.guild(interaction.guild!)} » ${author} » ${commandName}`);
	}

	private shard(id: number) {
		return `${blue(`SHARD[${id.toString()}]`)}`;
	}

	private command(command: ChatInputCommand) {
		return cyan(`${command.name} [Chat Input]`);
	}

	private author(author: User) {
		return `${author.username}(${yellow(author.id)})`;
	}

	private guild(guild: Guild) {
		return `${guild.name}(${cyan(guild.id)})`;
	}
}
