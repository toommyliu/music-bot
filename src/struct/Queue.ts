import type { Track as Track_ } from '@lavaclient/types/v3';
import type { Node } from 'lavaclient';
import { container } from 'tsyringe';
import { kManager } from '../tokens.js';

// https://github.com/lavaclient/plugins/blob/master/packages/queue/src/lib/Queue.ts
export class Queue {
	public tracks: Track[];

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

export type Track = Track_ & { requestedBy: string };
export type Addable = Track | string;
export type QueueMap = Map<string, Queue>;
