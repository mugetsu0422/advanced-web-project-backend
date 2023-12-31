import { Injectable } from '@nestjs/common'
import { ClassParticipants } from 'src/entity/class-participants.entity'
import { Class } from 'src/entity/classes.entity'
import { Notification } from 'src/entity/notifications.entity'
import { User } from 'src/entity/users.entity'
import { UserRole } from 'src/model/role.enum'
import { DataSource } from 'typeorm'
import {
  studentNotificationTemplates,
  teacherNotificationTemplates,
} from './notifications.template'
import { GradeComposition } from 'src/entity/grade-compositions.entity'

@Injectable()
export class NotificationsService {
  constructor(private readonly dataSource: DataSource) {}

  async getNotificationCount(userid: string): Promise<number> {
    try {
      return await this.dataSource
        .createQueryBuilder(Notification, 'n')
        .where('userid = :id', { id: userid })
        .getCount()
    } catch (error) {
      console.error(error)
    }
  }

  async getNotificationByOffset(
    userid: string,
    offset: number,
    limit: number
  ): Promise<Notification[]> {
    try {
      return await this.dataSource
        .createQueryBuilder(Notification, 'n')
        .select(['n.content', 'n.link', 'n.createTime'])
        .where('userid = :id', { id: userid })
        .orderBy('n.createTime', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany()
    } catch (error) {
      console.log(error)
    }
  }

  // When a teacher finalizes a grade composition,
  // create notifications to all students in the class
  async createGPFinalizedNotification(gpNames: string[], classid: string) {
    // Get students' userid list
    const students = await this.dataSource
      .createQueryBuilder(ClassParticipants, 'cp')
      .select(['cp.userid as userid', 'c.name as classname'])
      .innerJoin(User, 'u', 'cp.userid = u.userid')
      .innerJoin(Class, 'c', 'cp.classid = c.id')
      .where('cp.classid = :classid', { classid: classid })
      .andWhere('u.role = :role', { role: UserRole.Student })
      .getRawMany()

    const timestamp = new Date()

    let notifications = []
    gpNames.forEach((name) => {
      notifications = notifications.concat(
        students.map((stu) => {
          return {
            userID: stu.userid,
            content: studentNotificationTemplates.gradeCompositionFinalized(
              name,
              stu.classname
            ),
            link: `/student/class/${classid}/scoreboard`,
            createTime: timestamp,
          }
        })
      )
    })

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notifications)
      .execute()
  }

  // When a teacher replies to a student grade review
  async createTeacherReplyNotification(userid: string, gpid: string) {
    const { classid, className, gpName } = await this.dataSource
      .createQueryBuilder(GradeComposition, 'gp')
      .select([
        'c.classid as classid',
        'c.name as className',
        'gp.name as gpName',
      ])
      .innerJoin(Class, 'c', 'gp.classid = c.id')
      .where('gp.id = :gpid', { gpid: gpid })
      .getRawOne()

    const notification = {
      userID: userid,
      content: studentNotificationTemplates.teacherRepliedToGradeReview(
        gpName,
        className
      ),
      // LINK TO BE CHANGED
      link: `/student/class/${classid}/scoreboard/grade-review/detail?gradeid=${gpid}&userid=${userid}`,
      createTime: new Date(),
    }

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notification)
      .execute()
  }

  // When a teacher creates a final decision on a mark review
  async createFinalMarkReviewNotification(userid: string, gpid: string) {
    const { classid, className, gpName } = await this.dataSource
      .createQueryBuilder(GradeComposition, 'gp')
      .select([
        'c.classid as classid',
        'c.name as className',
        'gp.name as gpName',
      ])
      .innerJoin(Class, 'c', 'gp.classid = c.id')
      .where('gp.id = :gpid', { gpid: gpid })
      .getRawOne()

    const notification = {
      userID: userid,
      content: studentNotificationTemplates.finalDecisionOnMarkReview(
        gpName,
        className
      ),
      // LINK TO BE CHANGED
      link: `/student/class/${classid}/scoreboard/grade-review/detail?gradeid=${gpid}&userid=${userid}`,
      createTime: new Date(),
    }

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notification)
      .execute()
  }

  // When student requests a grade review
  async createGradeReviewRequestNotification(
    studentUserid: string,
    gpid: string
  ) {
    const { classid, className, gpName } = await this.dataSource
      .createQueryBuilder(GradeComposition, 'gp')
      .select([
        'c.classid as classid',
        'c.name as className',
        'gp.name as gpName',
      ])
      .innerJoin(Class, 'c', 'gp.classid = c.id')
      .where('gp.id = :gpid', { gpid: gpid })
      .getRawOne()

    const creator = await this.dataSource
      .createQueryBuilder(Class, 'c')
      .select(['c.creator'])
      .where('c.ClassID = :classid', { classid: classid })
      .getOne()

    const teachers = await this.dataSource
      .createQueryBuilder(Class, 'c')
      .select(['cp.userid as userid'])
      .innerJoin(ClassParticipants, 'cp', 'c.classid = cp.classid')
      .innerJoin(User, 'u', 'u.userid = cp.userid')
      .where('c.classid = :classid', { classid: classid })
      .andWhere('u.role = :role', { role: UserRole.Teacher })
      .getRawMany()

    const timestamp = new Date()
    const notifications = []
    notifications.push({
      userID: creator.creator,
      content: teacherNotificationTemplates.gradeReviewRequested(
        gpName,
        className
      ),
      link: `/teacher/class/${classid}/grade-review/detail?gradeid=${gpid}&userid=${studentUserid}`,
      createTime: timestamp,
    })
    teachers.forEach((teacher) => {
      notifications.push({
        userID: teacher.userid,
        content: teacherNotificationTemplates.gradeReviewRequested(
          gpName,
          className
        ),
        link: `/teacher/class/${classid}/grade-review/detail?gradeid=${gpid}&userid=${studentUserid}`,
        createTime: timestamp,
      })
    })

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notifications)
      .execute()
  }

  // When a student replies to a teacher grade review
  async createStudentReplyNotification(studentUserid: string, gpid: string) {
    const { classid, className, gpName } = await this.dataSource
      .createQueryBuilder(GradeComposition, 'gp')
      .select([
        'c.classid as classid',
        'c.name as className',
        'gp.name as gpName',
      ])
      .innerJoin(Class, 'c', 'gp.classid = c.id')
      .where('gp.id = :gpid', { gpid: gpid })
      .getRawOne()

    const creator = await this.dataSource
      .createQueryBuilder(Class, 'c')
      .select(['c.creator'])
      .where('c.ClassID = :classid', { classid: classid })
      .getOne()

    const teachers = await this.dataSource
      .createQueryBuilder(Class, 'c')
      .select(['cp.userid as userid'])
      .innerJoin(ClassParticipants, 'cp', 'c.classid = cp.classid')
      .innerJoin(User, 'u', 'u.userid = cp.userid')
      .where('c.classid = :classid', { classid: classid })
      .andWhere('u.role = :role', { role: UserRole.Teacher })
      .getRawMany()

    const timestamp = new Date()
    const notifications = []
    notifications.push({
      userID: creator.creator,
      content: teacherNotificationTemplates.studentRepliedToGradeReview(
        gpName,
        className
      ),
      link: `/teacher/class/${classid}/grade-review/detail?gradeid=${gpid}&userid=${studentUserid}`,
      createTime: timestamp,
    })
    teachers.forEach((teacher) => {
      notifications.push({
        userID: teacher.userid,
        content: teacherNotificationTemplates.studentRepliedToGradeReview(
          gpName,
          className
        ),
        link: `/teacher/class/${classid}/grade-review/detail?gradeid=${gpid}&userid=${studentUserid}`,
        createTime: timestamp,
      })
    })

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(notifications)
      .execute()
  }
}
