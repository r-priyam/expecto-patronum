import { fileURLToPath } from 'node:url';
import { REST } from '@discordjs/rest';
import { red, yellow, blue } from 'colorette';
import { Routes } from 'discord-api-types/v9';
import env from 'dotenv';
import ora from 'ora';
import prompts from 'prompts';

env.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

let commandType;
let commandLevel;
let guildId;

async function getResponses() {
	const response = await prompts([
		{
			type: 'select',
			name: 'commandType',
			message: 'Choose what you want to delete?',
			choices: [
				{ title: 'Application command (Slash)', value: 'application-command' },
				{ title: 'User command (Context menu)', value: 'user-command' }
			]
		},
		{
			type: 'select',
			name: 'commandLevel',
			message: 'Choose the command level?',
			choices: [
				{ title: 'Global', value: 'global-command' },
				{ title: 'Guild', value: 'guild-command' }
			]
		}
	]);

	if (!response.commandType || !response.commandLevel) {
		process.exit(1);
	}

	commandType = response.commandType;
	commandLevel = response.commandLevel;

	if (response.commandLevel === 'guild-command') {
		const guildResponse = await prompts([
			{
				type: 'text',
				name: 'guildId',
				message: 'Please enter the guild id to delete commands for'
			}
		]);
		guildId = guildResponse.guildId;
	}
}

function checkEnvVars() {
	const spinner = ora('Checking for Bot token and Client id').start();
	if (!process.env.BOT_CLIENT_ID || !process.env.BOT_TOKEN) {
		console.log(red('Bot token and Client id not found in environment variables.'));
		process.exit(1);
	}

	spinner.succeed('Bot token and Client id found');
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

async function fetchCommands() {
	let commands;
	let filteredCommands;

	if (commandLevel === 'guild-command') {
		commands = await rest.get(Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, guildId));
	} else {
		commands = await rest.get(Routes.applicationCommands(process.env.BOT_CLIENT_ID));
	}

	if (commands.length === 0) {
		console.log(red('No command found, exiting!'));
		process.exit(0);
	}

	if (commandType === 'application-command') {
		filteredCommands = commands.filter((command) => command.type === 1);

		if (!filteredCommands) {
			console.log(red('No application command found, exiting!'));
			process.exit(1);
		}
	} else {
		filteredCommands = commands.filter((command) => command.type === 3);

		if (!filteredCommands) {
			console.log(red('No user command found, exiting!'));
			process.exit(1);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return filteredCommands;
}

async function handleCommandDelete(commands) {
	const commandToDelete = await prompts([
		{
			type: 'select',
			name: 'commandType',
			message: 'Which command you want to delete?',
			choices: commands.map((command) => ({ title: command.name, value: { ...command } }))
		}
	]);

	if (!commandToDelete) {
		process.exit(1);
	}

	const confirmation = await prompts([
		{
			type: 'confirm',
			name: 'confirm',
			message: `Confirm if you want to ${red('DELETE')} ${blue('COMMAND:')} ${yellow(commandToDelete.commandType.name)}`
		}
	]);

	if (!confirmation) {
		process.exitCode(1);
	}

	const spinner = ora(`Sending request to ${red('DELETE')} ${blue('COMMAND:')} ${yellow(commandToDelete.commandType.name)}`).start();

	if (commandLevel === 'guild-command') {
		commands = await rest.delete(Routes.applicationGuildCommand(process.env.BOT_CLIENT_ID, guildId, commandToDelete.commandType.id));
	} else {
		commands = await rest.get(Routes.applicationCommand(process.env.BOT_CLIENT_ID, commandToDelete.commandType.id));
	}

	spinner.succeed('Success');
	process.exit(0);
}

await getResponses();
checkEnvVars();

const commands = await fetchCommands();
await handleCommandDelete(commands);
