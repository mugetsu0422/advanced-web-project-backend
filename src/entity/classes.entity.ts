import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity({ name: 'classes' })
export class Class {
  @PrimaryGeneratedColumn('uuid', { name: 'ClassID' })
  id: string

  @Column({ name: 'ClassName', type: 'varchar', length: 100 })
  name: string

  @Column({ name: 'ClassDescription', type: 'text', nullable: true })
  description: string

  @Column({ name: 'Creator', type: 'varchar', length: 36 })
  creator: string

  @CreateDateColumn({ name: 'CreateTime', type: 'datetime', nullable: true })
  createTime: Date

  @Column({ name: 'Code', type: 'varchar', length: 10, default: '' })
  code: string

  @Column({ name: 'Link', type: 'varchar', length: 100, default: '' })
  link: string

  @Column({ name: 'IsClosed', type: 'boolean', default: false })
  isClosed: boolean

  @Column({ name: 'IsDelete', type: 'boolean', default: false })
  isDelete: boolean
}
