import { on } from 'node:events';
import { type Events, type CacheType, type Interaction, inlineCode, Client } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { kCommands, kClient } from '../tokens.js';
import type { Command } from '#struct/Command';
import type { Event } from '#struct/Event';
import { logger } from '#util/logger';

@injectable()
export default class implements Event<typeof Events.InteractionCreate> {
	public constructor(
		@inject(kClient) private readonly client: Client,
		@inject(kCommands) public readonly commands: Map<string, Command>,
	) {}

	public async handle() {
		for await (const [interaction] of on(this.client, 'interactionCreate') as AsyncIterableIterator<
			[Interaction<CacheType>]
		>) {
			if (!interaction.inCachedGuild()) return;

			if (interaction.isChatInputCommand()) {
				const command = this.commands.get(interaction.commandName);

				try {
					await command?.handle(interaction);
				} catch (error_) {
					const error = error_ as Error;

					logger.error(
						{
							err: error,
							command: interaction.commandName,
						},
						'Error handling command',
					);
					const content = `An error occured while running the command\n\n${inlineCode(
						error as unknown as Error['message'],
					)}`;

					if (interaction.replied) {
						await interaction.followUp({ content, ephemeral: true });
						return;
					}

					await interaction.reply({ content, ephemeral: true });
				}
			}
		}
	}
}
