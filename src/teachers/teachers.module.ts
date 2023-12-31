import { Module } from '@nestjs/common'
import { TeachersController } from './teachers.controller'
import { TeachersService } from './teachers.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class } from 'src/entity/classes.entity'
import { ClassParticipants } from 'src/entity/class-participants.entity'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { ClassStudentList } from 'src/entity/class-student-list.entity'
import { Student } from 'src/entity/students.entity'
import { Grade } from 'src/entity/grades.entity'
import { User } from 'src/entity/users.entity'
import { OverallGrade } from 'src/entity/overall-grades.entity'
import { NotificationsService } from 'src/notifications/notifications.service'
import { GradeReview } from 'src/entity/grade-reviews.entity'
import { GradeReviewComment } from 'src/entity/grade-review-comments.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Class]),
    TypeOrmModule.forFeature([ClassParticipants]),
    TypeOrmModule.forFeature([GradeComposition]),
    TypeOrmModule.forFeature([ClassStudentList]),
    TypeOrmModule.forFeature([Grade]),
    TypeOrmModule.forFeature([Student]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([OverallGrade]),
    TypeOrmModule.forFeature([GradeReview]),
    TypeOrmModule.forFeature([GradeReviewComment]),
  ],
  controllers: [TeachersController],
  exports: [TeachersService],
  providers: [TeachersService, NotificationsService],
})
export class TeachersModule {}
