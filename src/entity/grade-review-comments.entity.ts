import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'grade_review_comments' })
export class GradeReviewComment {
  @PrimaryGeneratedColumn('uuid', { name: 'CommentID' })
  commentID: string

  @Column({ name: 'GradeCompositionID' })
  gradeCompositionID: string

  @Column({ name: 'UserID', type: 'varchar', length: 36 })
  userID: string

  @Column({ name: 'AuthorID', type: 'varchar', length: 36 })
  authorID: string

  @Column({ name: 'CreateTime', type: 'datetime', nullable: true })
  createTime: Date
}
