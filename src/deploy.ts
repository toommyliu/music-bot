import 'reflect-metadata';

import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { REST, Routes } from 'discord.js';
import readdirp from 'readdirp';
import { logger } from '#util/logger.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

const applicationId = process.env.APPLICATION_ID;
const guildId = process.env.GUILD_ID;

void (async () => {
	try {
		if (!applicationId || !guildId) {
			logger.warn('Missing env variables APPLICATION_ID and GUILD_ID');
			return;
		}

		const commands = [];
		const commandFiles = readdirp(fileURLToPath(new URL('interactions', import.meta.url)), {
			fileFilter: '*.js',
		});
		for await (const commandFile of commandFiles) {
			const command = await import(commandFile.fullPath);
			commands.push(command.default);
		}

		await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
			body: commands,
		});

		logger.info('Deployed application (/) commands to guild');
	} catch (error_) {
		const error = error_ as Error;
		logger.error(error.stack, 'Failed to refresh application (/) commands');
	}
})();
