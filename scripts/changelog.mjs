// changelog generator that just works for me

import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import util from 'node:util';

const heading =
	'# Changelog\n\nAll notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.';

const capital = (word) => word.replace(/^./, word[0].toUpperCase());
const shortHash = (hash) => `\`${hash.slice(0, 7)}\``;
const commitUrl = (hash) => `https://github.com/r-priyam/expecto-patronum/commits/${hash}`;
const compareUrl = (previousTag, currentTag) => `https://github.com/r-priyam/expecto-patronum/compare/${previousTag}...${currentTag}`;

async function generateChanegLog() {
	const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
	const changeLog = { features: [], bugFixes: [], optimization: [], improvements: [] };

	// TODO: make it better? can't think of anything for now
	let oldChangeLog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
	const oldChangesArray = oldChangeLog.split('\n');
	oldChangesArray.splice(0, 4);
	oldChangeLog = oldChangesArray.join('\n');

	const execute = util.promisify(exec);

	// get the latest tag and changes after that tag
	const { stdout: versionTag } = await execute('git describe --tags --abbrev=0');
	const { stdout: commits } = await execute(`git --no-pager log --pretty=format:"%s|%H" HEAD...${versionTag}`);

	const commitsArray = commits.split('\n').map((commit) => {
		const [message, hash] = commit.split('|');
		return { message, hash };
	});

	for (const commit of commitsArray) {
		const { message, hash } = commit;

		const type = message.split(':').shift();
		const formattedType = type.includes('(') ? type.slice(type.indexOf('(') + 1, type.lastIndexOf(')')) : '';
		const content = message.slice(Math.max(0, message.indexOf(':') + 1)).trim();
		const changeMessage = formattedType ? `**${capital(formattedType)}**: ${capital(content)}` : capital(content);

		if (message.startsWith('feat')) {
			changeLog.features.push(`* ✨ ${changeMessage} [${shortHash(hash)}](${commitUrl(hash)})\n`);
		}

		if (message.startsWith('fix')) {
			changeLog.bugFixes.push(`* 🐛 ${changeMessage} [${shortHash(hash)}](${commitUrl(hash)})\n`);
		}

		if (message.startsWith('refactor')) {
			changeLog.optimization.push(`* ⚒️  ${changeMessage} [${shortHash(hash)}](${commitUrl(hash)})\n`);
		}

		if (message.startsWith('perf')) {
			changeLog.improvements.push(`* 🚀 ${changeMessage} [${shortHash(hash)}](${commitUrl(hash)})\n`);
		}
	}

	let changeLogNew = `## [${version}](${compareUrl(versionTag.slice(1), version)}) (${new Date().toISOString().split('T')[0]})\n\n`;

	if (changeLog.features.length > 0) {
		changeLogNew += `### Features\n\n`;
		for (const feature of changeLog.features) {
			changeLogNew += feature;
		}
		changeLogNew += '\n';
	}

	if (changeLog.bugFixes.length > 0) {
		changeLogNew += `### Bug Fixes\n\n`;
		for (const bugFixes of changeLog.bugFixes) {
			changeLogNew += bugFixes;
		}
		changeLogNew += '\n';
	}

	if (changeLog.optimization.length > 0) {
		changeLogNew += `### Optimization\n\n`;
		for (const optimization of changeLog.optimization) {
			changeLogNew += optimization;
		}
		changeLogNew += '\n';
	}

	if (changeLog.improvements.length > 0) {
		changeLogNew += `### Imrpovements\n\n`;
		for (const improvements of changeLog.improvements) {
			changeLogNew += improvements;
		}
		changeLogNew += '\n';
	}

	await (oldChangeLog
		? writeFile(new URL('../CHANGELOG.md', import.meta.url), `${heading}\n\n${changeLogNew}${oldChangeLog}`)
		: writeFile(new URL('../CHANGELOG.md', import.meta.url), `${heading}\n\n${changeLogNew}`));

	await execute('git add CHANGELOG.md');
}

await generateChanegLog();
