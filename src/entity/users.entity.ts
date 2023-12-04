import { UserRole } from 'src/model/role.enum'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  UserID: string

  @Column({ name: 'UserName', type: 'varchar', length: 50, unique: true })
  username: string

  @Column({ name: 'FullName', type: 'varchar', length: 200, default: '' })
  fullname: string

  @Column({ name: 'Pass', type: 'binary', length: 60, nullable: true })
  password: string

  @Column({ name: 'GoogleID', type: 'varchar', length: 25, default: '' })
  googleID: string

  @Column({ name: 'FacebookID', type: 'varchar', length: 25, default: '' })
  facebookID: string

  @Column({ name: 'Email', type: 'varchar', length: 200, unique: true })
  email: string

  @Column({ name: 'Phone', type: 'varchar', length: 15, default: '' })
  phone: string

  @Column({ name: 'Address', type: 'varchar', length: 200, default: '' })
  address: string

  @Column({ name: 'Role', type: 'enum', enum: UserRole })
  role: UserRole

  @CreateDateColumn({ name: 'CreateTime', type: 'datetime' })
  createTime: Date

  @Column({ name: 'IsActivated', type: 'boolean', default: false })
  isActivated: boolean

  @Column({ name: 'IsLocked', type: 'boolean', default: false })
  isLocked: boolean

  @Column({ name: 'IsDelete', type: 'boolean', default: false })
  isDelete: boolean
}
