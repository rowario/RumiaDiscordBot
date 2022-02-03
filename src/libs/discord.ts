import { Client } from "discordx";
import { Intents, Interaction, Message } from "discord.js";
import { importx } from "@discordx/importer";
import path from "path";
import { getCustomRepository } from "typeorm";
import { CustomUserRepository } from "../entities/User";
import { runCrons } from "../crons";
import dayjs from "dayjs";

export const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
	botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});

client.on("ready", async () => {
	await client.guilds.fetch();

	// await client.clearApplicationCommands(...client.guilds.cache.map((x) => x.id));
	await client.initApplicationCommands();
	await client.initApplicationPermissions();

	await runCrons();
});

client.on("interactionCreate", async (interaction: Interaction) => {
	const {
		user: { id },
	} = interaction;
	await getCustomRepository(CustomUserRepository).findOneOrCreate({ id }, { id });

	try {
		client.executeInteraction(interaction);
	} catch (e) {
		console.log(`Got error while command execution`);
	}
});

const messagesHistory: Map<string, number> = new Map();

client.on("messageCreate", async (message: Message) => {
	if (message.author.bot) return;
	if (message.webhookId) return;

	const { id } = message.author;
	const userRepository = getCustomRepository(CustomUserRepository);
	const user = await userRepository.findOneOrCreate({ id }, { id });

	if (
		(messagesHistory.has(id) && (messagesHistory.get(id) ?? 0) > dayjs().unix() - 20) ||
		user.activity >= 144
	)
		return;

	// update activity
	messagesHistory.set(id, dayjs().unix());
	user.activity++;
	user.lastTick = dayjs().unix();
	await userRepository.save(user);
});

export async function runBot() {
	await importx(path.join(__dirname, "../commands/*.{ts,js}"));

	await client.login(process.env["DISCORD_TOKEN"] ?? "");
}
