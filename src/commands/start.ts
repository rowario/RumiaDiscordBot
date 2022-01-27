import { Discord, Slash } from "discordx";
import { CommandInteraction } from "discord.js";

@Discord()
class Start {
	@Slash("ping")
	async ping(interaction: CommandInteraction) {
		await interaction.reply("pong");
	}
}
