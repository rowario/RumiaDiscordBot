import { InteractionCollector, Message, MessageComponentInteraction, User } from "discord.js";

export default (
	author: User,
	message: Message,
	filters: string[],
	cb: (
		interaction: MessageComponentInteraction,
		collector: InteractionCollector<MessageComponentInteraction>
	) => Promise<void>,
	end?: () => Promise<void>
): void => {
	const filter = (interaction: MessageComponentInteraction) => {
		return filters.some((x) => x === interaction.customId && interaction.user.id === author.id);
	};

	const collector = message.createMessageComponentCollector({
		filter,
		time: 240 * 1000,
	});

	collector.on("collect", async (interaction) => {
		try {
			await collector.resetTimer();
			await cb(interaction, collector);
			if (!interaction.replied && !interaction.deferred) await interaction.deferUpdate();
		} catch (e) {
			console.log(`Got error in collector.`);
		}
	});

	collector.on("end", async () => {
		if (!end) {
			if (message.deletable) await message.delete();
			return;
		}
		await end();
	});
};
