import process from 'node:process';
import type { Events } from 'discord.js';
import { Node } from 'lavaclient';
import { inject, injectable } from 'tsyringe';
import { kManager } from '../tokens.js';
import type { Event } from '#struct/Event';
import { logger } from '#util/logger.js';

@injectable()
export default class implements Event<typeof Events.ClientReady> {
	public constructor(@inject(kManager) private readonly node: Node) {}

	public async handle() {
		logger.info('Logged in');

		this.node.connect(process.env.APPLICATION_ID!);
	}
}
