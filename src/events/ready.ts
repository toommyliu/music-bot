import process from 'node:process';
import { Client } from 'discord.js';
import type { Events } from 'discord.js';
import { Node } from 'lavaclient';
import { injectable, inject } from 'tsyringe';
import { kManager, kClient } from '../tokens.js';
import type { Event } from '#struct/Event';
import { logger } from '#util/logger.js';

@injectable()
export default class implements Event<typeof Events.ClientReady> {
	public constructor(@inject(kClient) private readonly client: Client, @inject(kManager) private readonly node: Node) {}

	public handle() {
		this.client.on('ready', () => {
			logger.info('Logged in');
			this.node.connect(process.env.APPLICATION_ID!);
		});
	}
}
