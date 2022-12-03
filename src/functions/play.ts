import type { Node } from 'lavaclient';
import { container } from 'tsyringe';
import { kManager } from '../tokens.js';
import { create } from './create.js';
import { get } from './get.js';

export function play(guildId: string, playerInfo?: PlayerInfo) {
	const queue = get(guildId) ?? create(guildId, playerInfo!);

	if (queue.tracks.length) {
		const node = container.resolve<Node>(kManager);
		const player = node.players.get(guildId) ?? node.createPlayer(guildId);

		if (!player.playing && playerInfo) {
			player.connect(playerInfo.voiceChannelId, { deafened: true });
		}
	}
}

export type PlayerInfo = {
	textChannelId: string;
	voiceChannelId: string;
};
