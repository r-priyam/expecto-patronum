import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Command, UserError } from '@sapphire/framework';
import { Args, Identifiers } from '@sapphire/framework';
import { Duration, DurationFormatter } from '@sapphire/time-utilities';
import { inlineCodeBlock } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';

import { ExpectoPatronumCommand } from '#lib/structures/ExpectoPatronumCommands';
import { Config } from '#root/config';
import { isMessage } from '#utils/util';

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
		const actions = String(await args.pick(this.subCommandCheck).catch(() => 'create')) as keyof ReminderCommandActions;
		return actions === 'list' || actions === 'clear' ? this[actions](message) : this[actions](message, args);
	}

	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await interaction.deferReply({ ephemeral: true });
		const subcommand = interaction.options.getSubcommand(true) as keyof ReminderCommandActions;
		return this[subcommand](interaction);
	}

	public async create(messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, args?: Args) {
		let time = '';
		let reminderMessage = '';

		if (isMessage(messageOrInteraction)) {
			time = await args!.pick('string').catch((error: UserError) => {
				this.userError({
					message:
						error.identifier === Identifiers.ArgsMissing
							? `Please provide the arguments in correct format.\nExample: ${inlineCodeBlock('remind 1d about something')}`
							: `Provided time seems to invalid. Please provide the time in correct format.\nExample: ${inlineCodeBlock(
									'1h, 1d, 1week and try and see.'
							  )}`
				});
			});
			reminderMessage = await args!.rest('string').catch((_) => {
				this.userError({ message: `Please provide the message to remind for.\nExample: ${inlineCodeBlock('remind 1d about something')}` });
			});
		} else {
			time = messageOrInteraction.options.getString('time')!;
			reminderMessage = messageOrInteraction.options.getString('message')!;
		}

		const duration = new Duration(time);
		if (!isNaN(duration.offset) && duration.offset) {
			if (duration.offset <= 12) {
				this.userError({ message: `Time less than ${inlineCodeBlock('2 minutes')} isn't allowed` });
			}
		} else {
			this.userError({ message: `Invalid time provided, try: ${inlineCodeBlock('1h')}, ${inlineCodeBlock('2d')}.` });
		}

		const created = await this.sql<[{ id: number }]>`
				INSERT INTO reminders (user_id, message, expires)
				VALUES (${messageOrInteraction.member!.id}, ${reminderMessage}, ${duration.fromNow})
				RETURNING id`;

		this.tasks.create(
			'reminder',
			{
				id: created[0].id,
				userId: messageOrInteraction.member!.id,
				message: reminderMessage,
				createdAt: new Date()
			},
			{ type: 'default', bullJobOptions: { jobId: `r${created[0].id}` }, delay: duration.offset }
		);

		const message = `Roger that! In ${new DurationFormatter().format(duration.offset)}, ${reminderMessage}. ${inlineCodeBlock(
			`ID ${created[0].id}`
		)}`;
		await (isMessage(messageOrInteraction) ? messageOrInteraction.reply(message) : messageOrInteraction.editReply({ content: message }));
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async list(_messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>) {
		// Const reminders = await this.sql<ReminderList[]>`SELECT id, message, expires FROM reminders WHERE user_id = ${messageOrInteraction.member!.id}`;
	}

	public delete(_messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, _args?: Args) {
		//
	}

	public clear(_messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>) {
		//
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
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
			{ guildIds: Config.bot.testingGuilds, idHints: [''] }
		);
	}
}

interface ReminderCommandActions {
	create: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, args?: Args) => void;
	clear: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>) => void;
	delete: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, args?: Args) => void;
	list: (messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>) => void;
}

// Interface ReminderList {
// 	id: number;
// 	message: string;
// 	expires: Date;
// }
