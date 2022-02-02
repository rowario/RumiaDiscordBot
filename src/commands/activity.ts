import { Discord, Permission, Slash, SlashGroup } from "discordx";
import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { UserEntity } from "../entities/User";
import dayjs from "dayjs";
import getDefaultPermissions from "../helpers/getDefaultPermissions";

@Discord()
@SlashGroup("activity")
@Permission(false)
@Permission(getDefaultPermissions)
@Permission({ id: "936403946128412763", type: "ROLE", permission: true })
class Activity {
	@Slash("top")
	async top(interaction: CommandInteraction<"cached">) {
		const users = await getRepository(UserEntity).find({
			order: {
				activity: -1,
			},
			take: 10,
		});
		const {
			guild: { members },
		} = interaction;
		const medals = ["🥇", "🥈", "🥉"];
		await interaction.reply(
			"Activity top: \n" +
				users
					.map((x, i) => {
						const medal = medals[i] ?? "🏅";
						return `${medal} **#${i + 1}** - ${
							members.cache.get(x.id)?.user.toString() ?? `<@${x.id}>`
						}`;
					})
					.join("\n")
		);
	}

	@Slash("reset")
	async reset(interaction: CommandInteraction) {
		await getRepository(UserEntity).update(
			{},
			{
				activity: 0,
				last_tick: dayjs().unix(),
			}
		);
		await interaction.reply("Activity top has been reseted!");
	}
}
