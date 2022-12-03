import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { Node } from 'lavaclient';
import { injectable, inject } from 'tsyringe';
import { kManager } from '../../tokens.js';
import type { Command } from '#struct/Command';

@injectable()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(@inject(kManager) private readonly node: Node) {}

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

		player.disconnect();
		await player.destroy();

		await interaction.editReply({ content: 'Successfully cleaned up.' });
	}
}
