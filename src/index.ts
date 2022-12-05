import 'reflect-metadata';

import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import { Client, GatewayIntentBits, type ClientEvents } from 'discord.js';
import { Node } from 'lavaclient';
import readdirp from 'readdirp';
import { container, type InjectionToken } from 'tsyringe';
import { type Command, commandInfo } from './struct/Command.js';
import { type Event, eventInfo } from './struct/Event.js';
import { kClient, kCommands, kManager, kQueue } from './tokens.js';
import { logger } from '#util/logger.js';

const client = new Client({
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildVoiceStates,
});

const commands = new Map<string, Command>();
const manager = new Node({
	connection: {
		host: process.env.LAVALINK_HOST!,
		port: 443,
		password: process.env.LAVALINK_PASSWORD!,
		secure: true,
	},
	sendGatewayPayload: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
});

void (async () => {
	container.register(kClient, { useValue: client });
	container.register(kManager, { useValue: manager });
	container.register(kQueue, { useValue: new Map() });
	container.register(kCommands, { useValue: commands });

	const commandFiles = readdirp(fileURLToPath(new URL('commands', import.meta.url)), {
		fileFilter: '*.js',
	});
	for await (const file of commandFiles) {
		const commandMod = (await import(file.fullPath)) as { default: InjectionToken<Command> };
		const command = container.resolve(commandMod.default);

		const cmdInfo = commandInfo(file.fullPath);
		if (!cmdInfo) {
			continue;
		}

		commands.set(cmdInfo.name, command);
		logger.info(`Registered commmand: ${cmdInfo.name}`);
	}

	const eventFiles = readdirp(fileURLToPath(new URL('events', import.meta.url)), {
		fileFilter: '*.js',
	});
	for await (const file of eventFiles) {
		const eventMod = (await import(file.fullPath)) as { default: InjectionToken<Event> };
		const event = container.resolve(eventMod.default);

		const eventInfo_ = eventInfo(file.fullPath);
		if (!eventInfo_) {
			continue;
		}

		const name = event.name ?? (eventInfo_.name as keyof ClientEvents);
		// @ts-expect-error #2772
		client.on(name, (...args) => event.handle(...args));
		logger.info(`Registered event: ${name}`);
	}

	// @ts-expect-error ws events
	client.ws.on('VOICE_SERVER_UPDATE', async (data) => manager.handleVoiceUpdate(data));
	// @ts-expect-error ws events
	client.ws.on('VOICE_STATE_UPDATE', async (data) => manager.handleVoiceUpdate(data));

	await client.login(process.env.DISCORD_TOKEN);
})();

declare module 'lavaclient' {
	type Track = {
		requestedBy: string;
	};
}
