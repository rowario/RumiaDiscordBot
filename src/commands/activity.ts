import { Discord, Permission, Slash, SlashGroup } from "discordx";
import { CommandInteraction, MessageCollector } from "discord.js";
import { getRepository } from "typeorm";
import { UserEntity } from "../entities/User";
import dayjs from "dayjs";
import getDefaultPermissions from "../helpers/getDefaultPermissions";
import embeds from "../data/embeds";

@Discord()
@SlashGroup("activity")
@Permission(false)
@Permission(getDefaultPermissions)
class Activity {
	@Slash("top")
	async top(interaction: CommandInteraction<"cached">) {
		const users = await getRepository(UserEntity).find({
			order: {
				activity: -1,
			},
			take: 9,
		});
		const {
			guild: {
				members: { cache: membersCache },
			},
		} = interaction;

		await interaction.reply({ embeds: [embeds.activityTop(users, membersCache)] });
	}

	@Slash("reset")
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
				await getRepository(UserEntity).update(
					{},
					{
						activity: 0,
						lastTick: dayjs().unix(),
					}
				);
				if (message.deletable) await message.delete();
				await interaction.editReply("Activity top successfully cleared!");
				await collector.stop("Activity top successfully cleared!");
			} else await collector.stop("Wrong message passed!");
		});
	}
}
