import { Discord, Slash, SlashGroup } from "discordx";
import { CommandInteraction, MessageCollector } from "discord.js";
import { getRepository } from "typeorm";
import { UserEntity } from "../entities/User";
import dayjs from "dayjs";
import embeds from "../data/embeds";
import timer from "../utils/timer";

@Discord()
@SlashGroup({ name: "activity" })
class Activity {
	@Slash("top", { description: "Shows top 10 members by activity" })
	@SlashGroup("activity")
	async top(interaction: CommandInteraction<"cached">) {
		const users = await getRepository(UserEntity).find({
			order: {
				overallActivity: -1,
			},
			take: 10,
		});
		const {
			guild: {
				members: { cache: membersCache },
			},
		} = interaction;

		await interaction.reply({ embeds: [embeds.activityTop(users, membersCache)] });
	}

	@Slash("reset", { description: "Resets all the activity top" })
	@SlashGroup("activity")
	async reset(interaction: CommandInteraction<"cached">) {
		if (!interaction.channel) return;
		await interaction.reply({
			ephemeral: true,
			content: "Send word *reset* to confirm your action!",
		});

		const collector = new MessageCollector(interaction.channel, {
			filter: (m) => m.author.id === interaction.member.id,
			time: 30 * 1000,
		});
		collector.on("collect", async (message) => {
			if (message.content === "reset") {
				if (message.deletable) await message.delete();
				await timer(1000);
				await getRepository(UserEntity).update(
					{},
					{
						activity: 0,
						overallActivity: 0,
						lastTick: dayjs().unix(),
					}
				);
				await interaction.editReply("Activity top successfully cleared!");
				collector.stop("Activity top successfully cleared!");
			} else collector.stop("Wrong message passed!");
		});
	}
}
