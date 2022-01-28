import updateLiveRoles from "./updateLiveRoles";

export const runCrons = async () => {
	await updateLiveRoles();
	setInterval(updateLiveRoles, 10000);
};
