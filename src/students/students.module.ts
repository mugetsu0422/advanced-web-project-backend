import { Module } from '@nestjs/common'
import { StudentsController } from './students.controller'
import { StudentsService } from './students.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from 'src/entity/students.entity'
import { User } from 'src/entity/users.entity'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { Grade } from 'src/entity/grades.entity'
import { GradeReview } from 'src/entity/grade-reviews.entity'
import { GradeReviewComment } from 'src/entity/grade-review-comments.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([GradeComposition]),
    TypeOrmModule.forFeature([Grade]),
    TypeOrmModule.forFeature([GradeReview]),
    TypeOrmModule.forFeature([GradeReviewComment]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
