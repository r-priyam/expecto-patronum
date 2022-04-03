import { ApplyOptions } from '@sapphire/decorators';
import { AllFlowsPrecondition, Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';

@ApplyOptions<Precondition.Options>({ position: 1 })
export class UserPrecondition extends AllFlowsPrecondition {
	public async chatInputRun(interaction: CommandInteraction) {
		return this.checkGuild(interaction.inGuild());
	}

	public async messageRun(message: Message) {
		return this.checkGuild(message.inGuild());
	}

	public async contextMenuRun(interaction: ContextMenuInteraction) {
		return this.checkGuild(interaction.inGuild());
	}

	private async checkGuild(guild: boolean) {
		return guild ? this.ok() : this.error({ message: "Using commands in DM aren't supported, please run in any server instead." });
	}
}
