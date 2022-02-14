import { getRepository } from "typeorm";
import { UserEntity } from "../entities/User";
import dayjs from "dayjs";

export default () => {
	const userRepository = getRepository(UserEntity);
	userRepository
		.find({
			where: {
				activity: {
					$gt: 0,
				},
				lastTick: {
					$lt: dayjs().unix() - 3600,
				},
			},
		})
		.then(async (users) => {
			for (const user of users) {
				user.activity--;
				if (user.overallActivity > 0) user.overallActivity--;
				user.lastTick += 3600;
				await userRepository.save(user);
			}
		});
};
