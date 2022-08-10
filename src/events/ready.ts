import { ActivityType } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { runCrons } from "../crons";
import { client } from "../libs/discord";

@Discord()
class Ready {
	@On("ready")
	async ready([readyClient]: ArgsOf<"ready">) {
		await client.guilds.fetch();
		await client.initApplicationCommands({
			global: {
				log: true,
			},
			guild: {
				log: true,
			},
		});

		readyClient.user.setActivity({
			type: ActivityType.Streaming,
			name: "Coding",
			url: "https://www.twitch.tv/rowario",
		});

		await runCrons();
	}
}
