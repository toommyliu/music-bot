import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { kQueue } from '../../tokens.js';
import type { Command } from '#struct/Command';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { QueueMap } from '#struct/Queue';

@injectable()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(@inject(kQueue) private readonly queues: QueueMap) {}

	public async handle(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const queue = this.queues.get(interaction.guildId);

		if (!queue?.tracks.length || !queue.player?.connected) {
			await interaction.editReply({ content: 'Play some music first.' });
			return;
		}

		const { volume } = queue.player;
		const newVolume = interaction.options.getInteger('level', false);
		if (newVolume) {
			await this.queues.get(interaction.guildId)!.player!.setVolume(Math.max(Math.min(newVolume, 100), 1));
			await interaction.editReply({ content: `Updated the volume to ${newVolume}%.` });
			return;
		}

		await interaction.editReply({ content: `The volume is at ${volume}%.` });
	}
}
