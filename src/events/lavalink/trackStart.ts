import { Client } from 'discord.js';
import { Node } from 'lavaclient';
import { injectable, inject } from 'tsyringe';
import { kManager, kClient } from '../../tokens.js';
import type { Event } from '#struct/Event';

@injectable()
export default class implements Event {
	public constructor(@inject(kClient) private readonly client: Client, @inject(kManager) private readonly node: Node) {}

	public handle() {
	}
}
