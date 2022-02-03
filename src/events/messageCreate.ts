import { ArgsOf, Discord, On } from "discordx";
import { getCustomRepository } from "typeorm";
import { CustomUserRepository } from "../entities/User";
import dayjs from "dayjs";
import getSettings from "../helpers/getSettings";

@Discord()
class MessageCreate {
	messagesHistory: Map<string, number> = new Map();

	@On("messageCreate")
	async activityIncrease([message]: ArgsOf<"messageCreate">) {
		if (message.author.bot) return;
		if (message.webhookId) return;

		const { id } = message.author;
		const userRepository = getCustomRepository(CustomUserRepository);
		const user = await userRepository.findOneOrCreate({ id }, { id });

		if (
			(this.messagesHistory.has(id) && (this.messagesHistory.get(id) ?? 0) > dayjs().unix() - 20) ||
			user.activity >= 144
		)
			return;

		this.messagesHistory.set(id, dayjs().unix());
		user.activity++;
		user.lastTick = dayjs().unix();
		await userRepository.save(user);
	}

	@On("messageCreate")
	async scamCleaner([message]: ArgsOf<"messageCreate">) {
		if (message.author.bot) return;
		if (message.webhookId) return;

		const settings = await getSettings();

		if (settings.scamIgnore.some((x) => message.member?.roles.cache.has(x))) return;

		if (
			message.content.includes("@everyone") &&
			["http://", "https://"].some((x) => message.content.includes(x))
		) {
			message.reply("Scam link detected!").then(async (x) => {
				if (message.deletable) await message.delete();
				setTimeout(() => {
					if (x.deletable) x.delete();
				}, 3000);
			});
		}
	}
}
