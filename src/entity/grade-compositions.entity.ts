import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm'

@Entity({ name: 'grade_compositions' })
export class GradeComposition {
  @PrimaryGeneratedColumn('uuid', { name: 'GradeCompositionID' })
  id: string

  @Column({ name: 'ClassID', type: 'varchar', length: 36 })
  classID: string

  @Column({ name: 'GradeCompositionName', type: 'varchar', length: 100 })
  name: string

  @Column({ name: 'GradeScale', type: 'int', default: 0 })
  scale: number

  @Column({ name: 'GradeCompositionOrder', type: 'int', default: 0 })
  order: number

  @CreateDateColumn({ name: 'CreateTime', type: 'datetime', nullable: true })
  createTime: Date

  @Column({ name: 'IsDelete', type: 'bool', default: false })
  isDelete: boolean

  @Column({ name: 'IsFinalized', type: 'bool', default: false })
  isFinalized: boolean
}
