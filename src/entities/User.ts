import { Column, Entity, EntityRepository, ObjectID, ObjectIdColumn, Repository } from "typeorm";

@Entity("users")
export class UserEntity {
    @ObjectIdColumn()
    _id!: ObjectID;

    @Column()
    id!: string;

    @Column()
    activity: number = 0;

    @Column()
    last_tick: number = 0;
}

@EntityRepository(UserEntity)
export class CustomUserRepository extends Repository<UserEntity> {
    async findOneOrCreate(find: Partial<UserEntity>, create: Partial<UserEntity>): Promise<UserEntity> {
        const user = await this.findOne(find);
        if (user) return user;
        return this.save(this.create(create));
    }
}
