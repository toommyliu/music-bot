import { container } from 'tsyringe';
import { kQueue } from '../tokens.js';
import type { QueueMap } from '#struct/Queue';

export function get(guildId: string) {
	return container.resolve<QueueMap>(kQueue).get(guildId);
}
