import { ArgsOf, Discord, On } from "discordx";
import { runCrons } from "../crons";
import { client } from "../libs/discord";

@Discord()
class Ready {
	@On("ready")
	async ready([readyClient]: ArgsOf<"ready">) {
		await client.guilds.fetch();

		// await client.clearApplicationCommands(...client.guilds.cache.map((x) => x.id));
		await client.initApplicationCommands();
		await client.initApplicationPermissions();

		readyClient.user.setActivity({
			type: "STREAMING",
			name: "Coding",
			url: "https://www.twitch.tv/rowario",
		});

		await runCrons();
	}
}
