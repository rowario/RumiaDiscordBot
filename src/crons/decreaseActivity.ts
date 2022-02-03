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
					$lt: dayjs().unix() - 60,
				},
			},
		})
		.then(async (users) => {
			for (const user of users) {
				user.activity--;
				user.lastTick += 600;
				await userRepository.save(user);
			}
		});
};
