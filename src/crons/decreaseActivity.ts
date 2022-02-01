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
				last_tick: {
					$lt: dayjs().unix() - 60,
				},
			},
		})
		.then(async (users) => {
			for (const user of users) {
				user.activity--;
				user.last_tick += 600;
				await userRepository.save(user);
			}
		});
};
