import updateLiveRoles from "./updateLiveRoles";
import { CronJob } from "cron";
import decreaseActivity from "./decreaseActivity";
import updateActivityTopRole from "./updateActivityTopRole";
import sendLiveNotifications from "./sendLiveNotifications";

export const runCrons = async () => {
	await updateLiveRoles();
	setInterval(updateLiveRoles, 10000);

	new CronJob("*/2 * * * *", decreaseActivity).start();
	new CronJob("* * * * *", sendLiveNotifications).start();
	new CronJob("* * * * *", updateActivityTopRole).start();
};
