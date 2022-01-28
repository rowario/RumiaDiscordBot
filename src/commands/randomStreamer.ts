import { Discord, Permission, Slash, SlashOption } from "discordx";
import { CommandInteraction, Role } from "discord.js";
import { getRepository } from "typeorm";
import { alreadyChosenEntity } from "../entities/alreadyChosen";
import dayjs from "dayjs";

@Discord()
@Permission(false)
@Permission({ id: "936403946128412763", type: "ROLE", permission: true })
class RandomStreamer {
	@Slash("random_streamer")
	async random(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		const chosenRepository = getRepository(alreadyChosenEntity);
		const alreadyChosen = (
			await chosenRepository.find({
				where: {
					date: {
						$gt: dayjs().unix() - 3600,
					},
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
					date: dayjs().unix(),
				})
			);

			await interaction.reply(`Random member: ${chosen.toString()}\nStream link: ${stream.url}`);
		} else await interaction.reply(`Cannot found any Streamers with this role!`);
	}
}
