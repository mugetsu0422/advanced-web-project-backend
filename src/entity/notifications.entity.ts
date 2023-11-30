import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'NotiID' })
  id: string

  @Column({ name: 'SenderID', type: 'varchar', length: 36 })
  senderID: string

  @Column({ name: 'ReceiverID', type: 'varchar', length: 36 })
  receiverID: string

  @Column({ name: 'Content', type: 'text', nullable: true })
  content: string
}
