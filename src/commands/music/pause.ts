import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { Node } from 'lavaclient';
import { singleton, inject } from 'tsyringe';
import { kManager, kQueue } from '../../tokens.js';
import type { Command } from '#struct/Command';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { QueueMap } from '#struct/Queue.js';

@singleton()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(
		@inject(kManager) private readonly node: Node,
		@inject(kQueue) private readonly queues: QueueMap,
	) {}

	public async handle(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const { voice } = interaction.member;

		if (!voice.channelId) {
			await interaction.editReply({ content: 'Join a voice channel first.' });
			return;
		}

		const player = this.node.players.get(interaction.guildId);
		if (!player?.playing) {
			await interaction.editReply({ content: 'Not playing anything.' });
			return;
		}

		if (player.channelId !== voice.channelId) {
			await interaction.editReply({ content: 'Cannot do that.' });
			return;
		}

		if (player.paused) {
			await interaction.editReply({ content: 'Already paused.' });
			return;
		}

		await player.pause(true);
		await interaction.editReply({ content: 'Paused music playback.' });
	}
}
