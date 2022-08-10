import { Client } from "discordx";
import { importx } from "@discordx/importer";
import path from "path";
import { GatewayIntentBits } from "discord.js";

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
	botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});

export async function run() {
	await importx(path.join(__dirname, "../{commands,events}/*.{ts,js}"));

	if (!process.env["DISCORD_TOKEN"])
		throw new Error("You have not installed your Discord Token!\nCheck your .env file!");
	await client.login(process.env["DISCORD_TOKEN"]);
}
