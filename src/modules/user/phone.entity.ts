import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { UserEntity } from "./user.entity"

@Entity("phone")
export class Phone {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    number: string

    @ManyToOne(() => UserEntity, (user) => user.phoneNumbers)
    userId: UserEntity
}