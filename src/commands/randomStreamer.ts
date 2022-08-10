import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { ActionRowBuilder, ActivityType, ButtonStyle, CommandInteraction, Role } from "discord.js";
import { getRepository } from "typeorm";
import { ChooseHistoryEntity } from "../entities/ChooseHistory";
import dayjs from "dayjs";
import embeds from "../data/embeds";
import { ButtonBuilder } from "@discordjs/builders";

@Discord()
@SlashGroup({ name: "random" })
class RandomStreamer {
	@Slash("get", { description: "Found 1 random streamer by role" })
	@SlashGroup("random")
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
						(j) => j.type === ActivityType.Streaming && j.name === "Twitch" && j.url
					).length > 0
				);
			})
			.filter((x) => {
				return alreadyChosen.indexOf(x.id) === -1;
			});

		let chosen = members.random();
		if (members.size > 0 && chosen && chosen.presence) {
			const stream = chosen.presence.activities.filter(
				(x) => x.type === ActivityType.Streaming && x.name === "Twitch"
			)[0];

			await chosenRepository.save(
				chosenRepository.create({
					id: chosen.id,
					roleId: role.id,
					date: dayjs().unix(),
				})
			);

			const button = new ButtonBuilder()
				.setURL(stream.url ?? "")
				.setStyle(ButtonStyle.Link)
				.setLabel("Twitch channel");

			await interaction.reply({
				embeds: [embeds.randomSteamer(stream, chosen)],
				components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
			});
		} else {
			await interaction.reply({
				ephemeral: true,
				content: "Cannot found any Streamers with this role!",
			});
		}
	}

	@Slash("history", { description: "Shows history of previous random streamers" })
	@SlashGroup("random")
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
	@SlashGroup("random")
	async clear(interaction: CommandInteraction) {
		await getRepository(ChooseHistoryEntity).delete({});
		await interaction.reply({
			ephemeral: true,
			content: "History successfully cleared!",
		});
	}
}
