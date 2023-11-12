import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  UserID: string

  @Column({ name: 'UserName', type: 'varchar', length: 50, unique: true })
  username: string

  @Column({ name: 'Pass', type: 'binary', length: 60 })
  password: string

  @Column({ name: 'Email', type: 'varchar', length: 200 })
  email: string

  @Column({ name: 'Phone', type: 'varchar', length: 15 })
  phone: string

  @Column({ name: 'Address', type: 'varchar', length: 200 })
  address: string

  @Column({ name: 'AccountType', type: 'int' })
  accountType: number

  @CreateDateColumn({ name: 'CreateTime', type: 'datetime' })
  createTime: Date

  @UpdateDateColumn({ name: 'UpdateTime', type: 'datetime' })
  updateTime: Date

  @Column({ name: 'IsLocked', type: 'boolean' })
  isLocked: boolean

  @Column({ name: 'IsDelete', type: 'boolean', default: false })
  isDelete: boolean
}
