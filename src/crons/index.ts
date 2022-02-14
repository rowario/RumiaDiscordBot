import updateLiveRoles from "./updateLiveRoles";
import { CronJob } from "cron";
import decreaseActivity from "./decreaseActivity";
import updateActivityRoles from "./updateActivityRoles";
import sendLiveNotifications from "./sendLiveNotifications";

export const runCrons = async () => {
	await updateLiveRoles();
	setInterval(updateLiveRoles, 10000);

	new CronJob("*/5 * * * *", decreaseActivity).start();
	new CronJob("* * * * *", sendLiveNotifications).start();
	new CronJob("* * * * *", updateActivityRoles).start();
};
