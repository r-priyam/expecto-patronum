import { bold } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import { exec } from 'child_process';
import type { Message } from 'discord.js';

import { EmbedBuilder } from '#root/lib/utils/embeds';
import { MiscEmotes } from '#root/lib/utils/emotes';
import { Prompter } from '#root/lib/utils/functions/prompter';

@ApplyOptions<Command.Options>({
	description: 'Pulls code changes from github and reloads',
	chatInputCommand: {
		register: false
	},
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		await message.channel.sendTyping();

		exec('git pull', async (_, stdout, __) => {
			if (stdout.startsWith('Already up to date')) {
				return message.reply({
					embeds: [EmbedBuilder.warning('Already up to date')],
					components: []
				});
			}

			const prompt = await Prompter.messagePrompter(message, 'Are you sure to proceed?');
			if (!prompt) {
				return;
			}

			exec('yarn build', async () => {
				const status = await this.performReload(this.filterModules(stdout));
				let message = '';
				status.commands.length > 0 && (message += `${bold('Commands')}\n${status.commands.join('\n')}\n`);
				status.listeners.length > 0 && (message += `${bold('Listeners')}\n${status.listeners.join('\n')}`);

				return prompt.promptMessage.edit({
					content: message
				});
			});
		});
	}

	private filterModules(output: string) {
		const modules = output
			.split('\n')
			.filter((line) => line.includes('.ts'))
			.map((value) => value.split('.ts')[0].trim());

		const modulesToReload: { commands: string[]; listeners: string[] } = { commands: [], listeners: [] };
		for (const path of modules) {
			if (path.startsWith('src/commands/')) {
				modulesToReload.commands.push(path.split('/').pop()!);
			} else if (path.startsWith('src/listeners/')) {
				modulesToReload.listeners.push(path.split('/').pop()!);
			}
		}
		return modulesToReload;
	}

	private async performReload(modulesToReload: { commands: string[]; listeners: string[] }) {
		const status: { [key: string]: string[] } = {};

		for (const key of modulesToReload.commands) {
			const timer = new Stopwatch();
			status.commands = [];
			const result = await this.reload_command(key);
			result
				? status.commands.push(`${MiscEmotes.Success} \`${key}\` **\`${timer.stop().toString()}\`**`)
				: status.commands.push(`${MiscEmotes.Error} \`${key}\` **\`${timer.stop().toString()}\`**`);
		}

		if (modulesToReload.listeners.length > 0) {
			for (const key of modulesToReload.listeners) {
				const timer = new Stopwatch();
				status.listeners = [];
				const result = await this.reload_listener(key);
				result
					? status.listeners.push(`${MiscEmotes.Success} \`${key}\`: ${result} **\`${timer.stop().toString()}\`**`)
					: status.listeners.push(`${MiscEmotes.Error} \`${key}\` **\`${timer.stop().toString()}\`**`);
			}
		}

		return status;
	}

	private async reload_command(key: string) {
		try {
			await this.container.stores.get('commands').get(key)!.reload();
			return true;
		} catch {
			return null;
		}
	}

	private async reload_listener(key: string) {
		try {
			// there can be multiple listeners in a file so it becomes a bit tricky
			// to get the listener by name so instead getting by name let's get all
			// the listeners inside a file and reload all of them one by one.
			let reloadedNames = '';
			const listeners = this.container.stores.get('listeners').filter((e) => e.location.full.includes(key));
			for (const [name, value] of listeners) {
				await value.reload();
				reloadedNames += `\`${name}\` `;
			}
			return reloadedNames;
		} catch {
			return null;
		}
	}
}
