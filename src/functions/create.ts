import { container } from 'tsyringe';
import { Queue, type QueueMap } from '../struct/Queue.js';
import { kQueue } from '../tokens.js';
import type { PlayerInfo } from './play.js';

export function create(guildId: string, playerInfo: PlayerInfo) {
	const queues = container.resolve<QueueMap>(kQueue);
	const queue = queues.get(guildId) ?? new Queue(guildId, playerInfo.textChannelId, playerInfo.voiceChannelId);

	if (!queues.has(guildId)) {
		queues.set(guildId, queue);
	}

	return queue;
}
