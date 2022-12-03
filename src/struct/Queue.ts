import type { TrackInfo } from '@lavaclient/types/v3';
import type { Node, Player } from 'lavaclient';
import { container } from 'tsyringe';
import { kManager } from '../tokens.js';

// https://github.com/lavaclient/plugins/blob/master/packages/queue/src/lib/Queue.ts
export class Queue {
	public tracks: TrackInfo[];

	public guildId: string;

	public voiceChannelId: string;

	public textChannelId: string;

	public constructor(guildId: string, textChannelId: string, voiceChannelId: string) {
		this.tracks = [];

		this.guildId = guildId;
		this.textChannelId = textChannelId;
		this.voiceChannelId = voiceChannelId;
	}

	public get player() {
		return container.resolve<Node>(kManager).players.get(this.guildId);
	}
}

export type Addable = TrackInfo | string;
export type QueueMap = Map<string, Queue>;
