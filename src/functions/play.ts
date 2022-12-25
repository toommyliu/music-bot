import type { Client } from 'discord.js';
import type { Node } from 'lavaclient';
import { container } from 'tsyringe';
import { kManager, kClient } from '../tokens.js';
import { create } from './create.js';
import { get } from './get.js';

const cache = new Map<string, string>();

export async function play(guildId: string, playerInfo?: PlayerInfo) {
	const client = container.resolve<Client>(kClient);
	const queue = get(guildId) ?? create(guildId, playerInfo!);

	if (queue.tracks.length) {
		const node = container.resolve<Node>(kManager);
		const player = node.players.get(guildId) ?? node.createPlayer(guildId);

		if (!player.playing && playerInfo) {
			const currentTrack = queue.tracks[0]!;
			queue.currentTrack = currentTrack;

			player.connect(playerInfo.voiceChannelId, { deafened: true });
			await player.play(currentTrack);

			player.on('trackStart', async () => {
				const channel = client.channels.cache.get(queue.textChannelId);
				if (channel?.isTextBased()) {
					if (cache.has(guildId)) {
						if (!queue.tracks.length) {
							return;
						}

						const id = cache.get(guildId);
						void channel.messages.cache
							.get(id!)
							?.edit(`Now playing: ${queue.tracks[0]?.info.title ?? 'Unknown track'}`);
						return;
					}

					const msg = await channel?.send(`Now playing: ${queue.tracks[0]?.info.title ?? 'Unknown track'}`);
					cache.set(guildId, msg.id);
				}
			});

			player.on('trackEnd', async (_, reason) => {
				const queue = get(guildId)!;
				queue.lastTrack = queue.tracks.shift();

				if (queue.tracks.length <= 0) {
					return;
				}

				const currentTrack = queue.tracks[0]!;
				queue.currentTrack = currentTrack;
				await player.play(currentTrack);
			});
		}
	}
}

export type PlayerInfo = {
	textChannelId: string;
	voiceChannelId: string;
};
