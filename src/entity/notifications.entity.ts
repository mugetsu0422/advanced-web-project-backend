import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm'

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'NotiID' })
  id: string

  @Column({ name: 'UserID', type: 'varchar', length: 36, nullable: false })
  userID: string

  @Column({ name: 'Content', type: 'text', nullable: false })
  content: string

  @Column({ name: 'Link', type: 'text', nullable: false })
  link: string

  @CreateDateColumn({ name: 'CreateTime', type: 'datetime', nullable: true })
  createTime: Date
}
