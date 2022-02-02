import { Discord, Permission, Slash, SlashGroup, SlashOption } from "discordx";
import { CommandInteraction, Role } from "discord.js";
import { getRepository } from "typeorm";
import { chooseHistoryEntity } from "../entities/chooseHistory";
import dayjs from "dayjs";
import getDefaultPermissions from "../helpers/getDefaultPermissions";
import getModeratorPermissions from "../helpers/getModeratorPermissions";

@Discord()
@SlashGroup("random")
@Permission(false)
@Permission(getDefaultPermissions)
@Permission(getModeratorPermissions)
class RandomStreamer {
	@Slash("get")
	async get(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		const chosenRepository = getRepository(chooseHistoryEntity);
		const alreadyChosen = (
			await chosenRepository.find({
				where: {
					date: {
						$gt: dayjs().unix() - 3600,
					},
					roleId: role.id,
				},
			})
		).map((x) => x.id);
		const members = role.members
			.filter((x) => {
				if (!x.presence?.activities) return false;
				return x.presence.activities.filter((j) => j.type === "STREAMING").length > 0;
			})
			.filter((x) => {
				return alreadyChosen.indexOf(x.id) === -1;
			});

		const chosen = members.random();
		if (members.size > 0 && chosen && chosen.presence) {
			const stream = chosen.presence.activities.filter((x) => x.type === "STREAMING")[0];

			await chosenRepository.save(
				chosenRepository.create({
					id: chosen.id,
					roleId: role.id,
					date: dayjs().unix(),
				})
			);

			await interaction.reply(`Random member: ${chosen.toString()}\nStream link: ${stream.url}`);
		} else await interaction.reply(`Cannot found any Streamers with this role!`);
	}

	@Slash("history")
	async history(interaction: CommandInteraction<"cached">) {
		const history = await getRepository(chooseHistoryEntity).find({
			order: {
				date: 1,
			},
		});
		if (history.length < 1) return void (await interaction.reply("0 items in history list!"));
		const {
			guild: { members, roles },
		} = interaction;
		await interaction.reply(
			"Random Streamers history: \n" +
				history
					.map(
						(x, i) =>
							`**#${i + 1}** - ${members.cache.get(x.id)?.user.tag ?? `${x.id}`} ` +
							`( ${roles.cache.get(x.roleId)?.name.replace("@", "") ?? `${x.roleId}`} ) ` +
							`<t:${x.date}:R>`
					)
					.join("\n")
		);
	}

	@Slash("clear")
	async clear(interaction: CommandInteraction) {
		await getRepository(chooseHistoryEntity).delete({});
		await interaction.reply("History successfully cleared!");
	}
}
