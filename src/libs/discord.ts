import { Client } from "discordx";
import { Intents } from "discord.js";
import { importx } from "@discordx/importer";
import path from "path";

export const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
	],
	botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});

export async function run() {
	await importx(path.join(__dirname, "../{commands,events}/*.{ts,js}"));
	await client.login(process.env["DISCORD_TOKEN"] ?? "");
}
