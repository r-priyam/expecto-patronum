import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { PaginatedMessageEmbedFields } from '@sapphire/discord.js-utilities';
import { Args, Identifiers, Command, UserError } from '@sapphire/framework';
import { fetchLanguage } from '@sapphire/plugin-i18next';
import { Duration, DurationFormatter, Time } from '@sapphire/time-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { Message } from 'discord.js';

import { prompter } from '#classes/prompter';
import { ExpectoPatronumCommand } from '#lib/structures/ExpectoPatronumCommands';
import { Colors } from '#utils/constants';
import { isMessage, plural } from '#utils/util';

@ApplyOptions<Command.Options>({
	aliases: ['timer', 'remind'],
	description: 'Creates a reminder to remind you about it after a certain amount of time'
})
export class ReminderCommand extends ExpectoPatronumCommand implements ReminderCommandActions {
	private readonly subCommandCheck = Args.make((parameter, { argument }) => {
		switch (parameter.toLowerCase()) {
			case 'list':
			case 'delete':
			case 'clear':
				return Args.ok(parameter.toLowerCase());
			default:
				return Args.error({ argument, parameter });
		}
	});

	public override async messageRun(message: Message, args: Args) {
		const actions = (await args.pick(this.subCommandCheck).catch(() => 'create')) as keyof ReminderCommandActions;
		return actions === 'list' || actions === 'clear' ? this[actions](message) : this[actions](message, args);
	}

	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await interaction.deferReply({ ephemeral: true });
		const subcommand = interaction.options.getSubcommand(true) as keyof ReminderCommandActions;
		return this[subcommand](interaction);
	}

	public override async contextMenuRun(interaction: Command.ContextMenuInteraction<'cached'>) {
		await interaction.deferReply({ ephemeral: true });

		const userId = interaction.options.getMessage('message', true).author.id;

		if (interaction.member.id !== userId) {
			return interaction.reply({ content: this.i18n.getT(interaction.locale)('commands/misc:reminder.error.contextMenuBypass') });
		}

		return interaction.commandName === 'Reminders List' ? this.list(interaction) : this.clear(interaction);
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addSubcommand((command) =>
						command
							.setName('create')
							.setDescription(this.description)
							.addStringOption((option) => option.setName('time').setDescription('Amount of time to remind after').setRequired(true))
							.addStringOption((option) => option.setName('message').setDescription('Message to remind for').setRequired(true))
					)
					.addSubcommand((command) => command.setName('clear').setDescription('Clears all reminders you have set'))
					.addSubcommand((command) =>
						command
							.setName('delete')
							.setDescription('Deletes a reminder by its id')
							.addNumberOption((option) => option.setName('id').setDescription('Id to delete reminder with').setRequired(true))
					)
					.addSubcommand((command) => command.setName('list').setDescription('Shows the active reminders')),
			{ idHints: [''] }
		);

		registry.registerContextMenuCommand(
			{
				name: 'Reminders List',
				type: 'MESSAGE'
			},
			{ idHints: [''] }
		);

		registry.registerContextMenuCommand(
			{
				name: 'Reminders Clear',
				type: 'MESSAGE'
			},
			{ idHints: [''] }
		);
	}

	public async create(messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, args?: Args) {
		let time: string;
		let reminderMessage: string;
		const t = this.i18n.getT(await fetchLanguage(messageOrInteraction));

		if (isMessage(messageOrInteraction)) {
			time = await args!.pick('string').catch((error: UserError) => {
				this.userError({
					message:
						error.identifier === Identifiers.ArgsMissing
							? t('commands/misc:reminder.error.argMissing')
							: t('commands/misc:reminder.error.invalidTime')
				});
			});
			reminderMessage = await args!.rest('string').catch(() => {
				this.userError({ message: t('commands/misc:reminder.error.messageMissing') });
			});
		} else {
			time = messageOrInteraction.options.getString('time', true);
			reminderMessage = messageOrInteraction.options.getString('message', true);
		}

		const duration = new Duration(time);
		if (!Number.isNaN(duration.offset) && duration.offset) {
			if (duration.offset <= 120_000) {
				this.userError({ message: t('commands/misc:reminder.error.notAllowedTime') });
			}
		} else {
			this.userError({ message: t('commands/misc:reminder.error.invalidTime') });
		}

		const [{ id }] = await this.sql<[{ id: number }]>`
			INSERT INTO reminders (user_id, message, created_at, expires_at)
			VALUES (${messageOrInteraction.member!.id}, ${reminderMessage}, ${new Date()}, ${duration.fromNow})
			RETURNING id`;

		this.tasks.create(
			'reminder',
			{
				id,
				userId: messageOrInteraction.member!.id,
				message: reminderMessage,
				createdAt: new Date()
			},
			{ type: 'default', bullJobOptions: { jobId: `r${id}` }, delay: duration.offset }
		);

		const message = t('commands/misc:reminder.success.reminderAdded', {
			time: new DurationFormatter().format(duration.offset),
			message: reminderMessage,
			id
		});
		await (isMessage(messageOrInteraction) ? messageOrInteraction.reply(message) : messageOrInteraction.editReply({ content: message }));
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async list(messageOrInteraction: Message | Command.ChatInputInteraction<'cached'> | Command.ContextMenuInteraction<'cached'>) {
		const t = this.i18n.getT(await fetchLanguage(messageOrInteraction));
		const reminders = await this.sql<ReminderList[]>`
			SELECT id, message, expires_at
			FROM reminders
			WHERE user_id =
				  ${messageOrInteraction.member!.id}`;

		if (reminders.length === 0) {
			this.userError({ message: t('commands/misc:reminder.error.noActiveReminders') });
		}

		await new PaginatedMessageEmbedFields() //
			.setTemplate({ title: `${messageOrInteraction.member!.displayName} Reminders`, color: Colors.Info })
			.setItems(
				reminders.map((reminder) => ({
					name: `ID: ${reminder.id}`,
					value: `${time(new Date(reminder.expiresAt), TimestampStyles.RelativeTime)}, ${reminder.message}`
				}))
			)
			.setItemsPerPage(10)
			.setIdle(Time.Minute * 2)
			.make()
			.run(messageOrInteraction);
	}

	public async delete(messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, args?: Args) {
		const t = this.i18n.getT(await fetchLanguage(messageOrInteraction));
		const reminderId = isMessage(messageOrInteraction)
			? await args!.pick('number').catch(() => {
					this.userError({
						message: t('commands/misc:reminder.error.deleteInvalidArg')
					});
			  })
			: messageOrInteraction.options.getNumber('id', true);

		const [{ id }] = await this.sql<[{ id?: number }]>`DELETE
														   FROM reminders
														   WHERE id = ${reminderId}
															 AND user_id = ${messageOrInteraction.member!.id}
														   RETURNING id`;

		if (!id) {
			this.userError({ message: t('commands/misc:reminder.error.noReminder') });
		}

		this.tasks.delete(`r${id}`);
		await (isMessage(messageOrInteraction)
			? messageOrInteraction.reply(t('commands/misc:reminder.success.reminderDeleted'))
			: messageOrInteraction.editReply({ content: t('commands/misc:reminder.success.reminderDeleted') }));
	}

	public async clear(messageOrInteraction: Message | Command.ChatInputInteraction<'cached'> | Command.ContextMenuInteraction<'cached'>) {
		const t = this.i18n.getT(await fetchLanguage(messageOrInteraction));
		const [{ count: remindersCount }] = await this.sql<[{ count: number }]>`SELECT COUNT(*)
																				FROM reminders
																				WHERE user_id = ${messageOrInteraction.member!.id}`;

		if (remindersCount === 0) {
			this.userError({ message: t('commands/misc:reminder.error.noActiveReminders') });
		}
		const word = plural(remindersCount, 'reminder', 'reminders');

		if (isMessage(messageOrInteraction)) {
			const prompt = await prompter.messagePrompter(
				messageOrInteraction,
				t('commands/misc:reminder.util.prompter', { count: remindersCount, word })
			);

			if (prompt) {
				await this.deleteReminders(messageOrInteraction.member!.id);
				//
				prompt.promptMessage.edit({
					content: t('commands/misc:reminder.success.reminderCleared', {
						count: remindersCount,
						word
					}),
					components: []
				});
			}

			return;
		}

		const prompt = await prompter.interactionPrompter(
			messageOrInteraction,
			t('commands/misc:reminder.util.prompter', { count: remindersCount, word })
		);

		if (prompt) {
			await this.deleteReminders(messageOrInteraction.member!.id);
			await messageOrInteraction.editReply({
				content: t('commands/misc:reminder.success.reminderCleared', {
					count: remindersCount,
					word
				}),
				components: []
			});
		}
	}

	private async deleteReminders(userId: string) {
		const deleted = await this.sql<Array<{ id: number }>>`DELETE
															  FROM reminders
															  WHERE user_id = ${userId}
															  RETURNING id`;
		for (const id of deleted) {
			await this.tasks.delete(`r${id}`);
		}
	}
}

interface ReminderCommandActions {
	create: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, args?: Args) => void;
	clear: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'> | Command.ContextMenuInteraction<'cached'>) => void;
	delete: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, args?: Args) => void;
	list: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'> | Command.ContextMenuInteraction<'cached'>) => void;
}

interface ReminderList {
	id: number;
	message: string;
	expiresAt: string;
}
