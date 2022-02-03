import { Discord, Permission, Slash, SlashGroup, SlashOption } from "discordx";
import { CommandInteraction, MessageActionRow, MessageButton, Role } from "discord.js";
import { getRepository } from "typeorm";
import { chooseHistoryEntity } from "../entities/chooseHistory";
import dayjs from "dayjs";
import getDefaultPermissions from "../helpers/getDefaultPermissions";
import getModeratorPermissions from "../helpers/getModeratorPermissions";
import embeds from "../data/embeds";

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

		let chosen = members.random();
		if (members.size > 0 && chosen && chosen.presence) {
			await chosen.fetch();
			const stream = chosen.presence.activities.filter(
				(x) => x.type === "STREAMING" && x.name === "Twitch"
			)[0];

			await chosenRepository.save(
				chosenRepository.create({
					id: chosen.id,
					roleId: role.id,
					date: dayjs().unix(),
				})
			);

			const button = new MessageButton()
				.setURL(stream.url ?? "")
				.setStyle("LINK")
				.setLabel("Twitch channel");

			await interaction.reply({
				embeds: [embeds.randomSteamer(stream, chosen)],
				components: [new MessageActionRow({ components: [button] })],
			});
		} else {
			await interaction.reply({
				ephemeral: true,
				content: "Cannot found any Streamers with this role!",
			});
		}
	}

	@Slash("history")
	async history(interaction: CommandInteraction<"cached">) {
		const history = await getRepository(chooseHistoryEntity).find({
			order: {
				date: 1,
			},
		});
		if (history.length < 1) {
			await interaction.reply({
				ephemeral: true,
				content: "There is no history of previous random streamers!",
			});
			return;
		}
		const {
			guild: {
				members: { cache: membersCache },
				roles: { cache: rolesCache },
			},
		} = interaction;

		await interaction.reply({
			embeds: [embeds.randomStreamersHistory(history, membersCache, rolesCache)],
		});
	}

	@Slash("clear")
	async clear(interaction: CommandInteraction) {
		await getRepository(chooseHistoryEntity).delete({});
		await interaction.reply({
			ephemeral: true,
			content: "History successfully cleared!",
		});
	}
}
