import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { Node } from 'lavaclient';
import { injectable, inject } from 'tsyringe';
import { kManager } from '../../tokens.js';
import type { Command } from '#struct/Command';
import { inVoiceChannel } from '#util/inVoiceChannel';

@injectable()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(@inject(kManager) private readonly node: Node) {}

	private async cleanup(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		const player = this.node.players.get(interaction.guildId);

		player?.disconnect();
		await player?.destroy();

		await interaction.editReply({ content: 'Successfully cleaned up.' });
	}

	public async handle(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		await interaction.deferReply();

		const player = this.node.players.get(interaction.guildId);
		const stop = interaction.options.getBoolean('force', false);
		if (stop) {
			await this.cleanup(interaction);
			return;
		}

		const { voice } = interaction.member;
		if (!inVoiceChannel(voice)) {
			await interaction.editReply({ content: 'Join a voice channel first.' });
			return;
		}

		if (!player?.playing) {
			await interaction.editReply({ content: 'Not playing anything.' });
			return;
		}

		if (player.channelId !== voice.channelId) {
			await interaction.editReply({ content: 'Cannot do that.' });
			return;
		}

		await this.cleanup(interaction);
	}
}
