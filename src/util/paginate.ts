// https://github.com/DankMemer/sniper
// Copyright (c) 2021 Dank Developers

// eslint-disable-next-line import/no-extraneous-dependencies
import { ActionRowBuilder, ButtonBuilder, type AnyComponentBuilder } from '@discordjs/builders';
import type { ButtonInteraction, CommandInteraction, Interaction, InteractionCollector } from 'discord.js';
import { ButtonStyle, ComponentType } from 'discord.js';

export class Paginate {
	public data: unknown[];

	public currentPage: number | null;

	public row: ActionRowBuilder<AnyComponentBuilder>;

	public stopRow: ActionRowBuilder<AnyComponentBuilder>;

	public constructor(data: unknown[]) {
		this.data = data;
		this.currentPage = null; // 0-indexed
		this.row = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('first').setLabel('<<').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('previous').setLabel('<').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('currentPage').setStyle(ButtonStyle.Secondary).setDisabled(true),
			new ButtonBuilder().setCustomId('next').setLabel('>').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('last').setLabel('>>').setStyle(ButtonStyle.Primary),
		);
		this.stopRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
		);
	}

	public async start({ interaction, time = 30_000 }: { interaction: CommandInteraction; time: number }) {
		const message = await interaction.reply({
			...this.getPage(0),
			fetchReply: true,
		});

		const filter = (int: Interaction) => {
			return int.user.id === interaction.user.id;
		};

		const collector = message.createMessageComponentCollector({
			time,
			filter,
			componentType: ComponentType.Button,
		});
		collector.on('collect', async (interaction) => this.onClicked(interaction, collector));
		collector.on('end', async () => this.onEnd(interaction));
	}

	public async onClicked(
		interaction: ButtonInteraction,
		collector: InteractionCollector<ButtonInteraction>,
	): Promise<void> {
		if (interaction.customId === 'first') {
			if (this.currentPage === 0) {
				void interaction.deferUpdate();
				return;
			}

			await interaction.update(this.getPage(0));
		} else if (interaction.customId === 'previous') {
			if (this.currentPage === 0) {
				void interaction.deferUpdate();
				return;
			}

			await interaction.update(this.getPage(this.currentPage! - 1));
		} else if (interaction.customId === 'next') {
			if (this.currentPage === this.data.length - 1) {
				void interaction.deferUpdate();
				return;
			}

			await interaction.update(this.getPage(this.currentPage! + 1));
		} else if (interaction.customId === 'last') {
			if (this.currentPage === this.data.length - 1) {
				void interaction.deferUpdate();
				return;
			}

			await interaction.update(this.getPage(this.data.length! - 1));
		} else if (interaction.customId === 'stop') {
			collector.stop();
		}
	}

	public async onEnd(interaction: CommandInteraction) {
		await interaction.editReply({ components: [] });
	}

	private getPage(number: number) {
		this.currentPage = number;
		// this.row.components!.find((component) => component.data?.cust)
		// .setLabel(`${number + 1}/${this.data.length}`);
		// @ts-expect-error this is fine
		return { ...this.data[number], components: [this.row, this.stopRow] };
	}
}
