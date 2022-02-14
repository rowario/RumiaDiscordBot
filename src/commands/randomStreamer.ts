import { Discord, Permission, Slash, SlashGroup, SlashOption } from "discordx";
import { CommandInteraction, MessageActionRow, MessageButton, Role } from "discord.js";
import { getRepository } from "typeorm";
import { ChooseHistoryEntity } from "../entities/ChooseHistory";
import dayjs from "dayjs";
import getDefaultPermissions from "../helpers/getDefaultPermissions";
import getModeratorPermissions from "../helpers/getModeratorPermissions";
import embeds from "../data/embeds";

@Discord()
@Permission(false)
@Permission(getDefaultPermissions)
@Permission(getModeratorPermissions)
@SlashGroup({ name: "random" })
class RandomStreamer {
	@Slash("get", { description: "Found 1 random streamer by role" })
	@SlashGroup({ name: "random" })
	async get(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		const chosenRepository = getRepository(ChooseHistoryEntity);
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
				return (
					x.presence.activities.filter(
						(j) => j.type === "STREAMING" && j.name === "Twitch" && j.url
					).length > 0
				);
			})
			.filter((x) => {
				return alreadyChosen.indexOf(x.id) === -1;
			});

		let chosen = members.random();
		if (members.size > 0 && chosen && chosen.presence) {
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

	@Slash("history", { description: "Shows history of previous random streamers" })
	@SlashGroup({ name: "random" })
	async history(interaction: CommandInteraction<"cached">) {
		const history = await getRepository(ChooseHistoryEntity).find({
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

	@Slash("clear", { description: "Clears random streamers history" })
	@SlashGroup({ name: "random" })
	async clear(interaction: CommandInteraction) {
		await getRepository(ChooseHistoryEntity).delete({});
		await interaction.reply({
			ephemeral: true,
			content: "History successfully cleared!",
		});
	}
}
