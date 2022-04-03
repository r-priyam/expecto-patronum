import { Time } from '@sapphire/time-utilities';
import type { ButtonInteraction, CommandInteraction, Message } from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';

import { MiscEmotes } from '#utils/emotes';

class UserPrompter {
	public async messagePrompter(message: Message, content: string, timeout = 60) {
		const promptMessage = await message.channel.send({ content, components: [this.promptComponents] });
		try {
			const confirmation = await this.waitForClick(promptMessage!, message.author.id, timeout);
			if (confirmation.customId === 'yes_button') {
				// return prompTmessage so that the origianl message can be edited
				// after performing any task, if any
				return { status: true, promptMessage };
			}

			await confirmation.editReply({ content: 'Aborting!', components: [] });
			return false;
		} catch (error: any) {
			if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
				await promptMessage.edit({ content: 'You took too log to reply!', components: [] });
				return false;
			}
		}
	}

	public async interactionPrompter(interaction: CommandInteraction<'cached'>, content: string, timeout = 60) {
		const promptMessage = await interaction.reply({ content, components: [this.promptComponents], fetchReply: true });
		try {
			const confirmation = await this.waitForClick(promptMessage, interaction.user.id, timeout);
			if (confirmation.customId === 'yes_button') {
				return true;
			}

			await interaction.editReply({ content: 'Aborting!', components: [] });
			return false;
		} catch (error) {
			await interaction.editReply({ content: 'You took too log to reply!', components: [] });
			return false;
		}
	}

	private async verifyUser(interaction: ButtonInteraction, userId: string) {
		if (!interaction.replied) {
			await interaction.deferUpdate();
		}
		if (interaction.user.id !== userId) {
			await interaction.followUp({ content: "These buttons can't be controlled by you, sorry!", ephemeral: true });
		}
		return interaction.customId === 'yes_button' || interaction.customId === 'no_button';
	}

	private async waitForClick(message: Message, userId: string, timeout: number) {
		return message.awaitMessageComponent({
			componentType: 'BUTTON',
			time: Time.Second * timeout,
			filter: (interaction) => this.verifyUser(interaction, userId)
		});
	}

	private get promptComponents() {
		const yesButton = new MessageButton() //
			.setCustomId('yes_button')
			.setEmoji(MiscEmotes.Success)
			.setStyle('PRIMARY')
			.setLabel('Yes');

		const noButton = new MessageButton() //
			.setCustomId('no_button')
			.setEmoji(MiscEmotes.Error)
			.setStyle('DANGER')
			.setLabel('No');

		return new MessageActionRow() //
			.setComponents([yesButton, noButton]);
	}
}

export const Prompter = new UserPrompter();
