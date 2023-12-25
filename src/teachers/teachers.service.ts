import { InjectRepository } from '@nestjs/typeorm'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { ClassStudentList } from 'src/entity/class-student-list.entity'
import { Student } from 'src/entity/students.entity'
import { Grade } from 'src/entity/grades.entity'
import { User } from 'src/entity/users.entity'
import { OverallGrade } from 'src/entity/overall-grades.entity'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DataSource, EntityNotFoundError, Repository, In } from 'typeorm'
import { Class } from 'src/entity/classes.entity'
import { v4 as uuidv4 } from 'uuid'
import { ClassParticipants } from 'src/entity/class-participants.entity'
import { UserRole } from 'src/model/role.enum'
import { NotificationsService } from 'src/notifications/notifications.service'
import { GradeReview } from 'src/entity/grade-reviews.entity'
import { GradeReviewComment } from 'src/entity/grade-review-comments.entity'

@Injectable()
export class TeachersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Class)
    private readonly classesRepo: Repository<Class>,
    @InjectRepository(ClassParticipants)
    private readonly classParticipantsRepo: Repository<ClassParticipants>,
    @InjectRepository(GradeComposition)
    private readonly gradeCompositionRepo: Repository<GradeComposition>,
    @InjectRepository(ClassStudentList)
    private readonly classStudentListRepo: Repository<ClassStudentList>,
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(OverallGrade)
    private readonly overallGradeRepo: Repository<OverallGrade>,
    private readonly notificationService: NotificationsService,
    @InjectRepository(GradeReview)
    private readonly gradeReviewRepo: Repository<GradeReview>,
    @InjectRepository(GradeReviewComment)
    private readonly gradeReviewCommentRepo: Repository<GradeReviewComment>
  ) {}

  async getClassAccess(userID: string, classID: string): Promise<boolean> {
    let flag
    flag = await this.classesRepo.findOne({
      where: {
        id: classID,
        creator: userID,
      },
    })
    if (flag) {
      return true
    } else {
      flag = await this.classParticipantsRepo.findOne({
        where: {
          classID: classID,
          userID: userID,
        },
      })
      return !!flag
    }
  }

  async createClass(_class: Class) {
    try {
      _class.id = uuidv4()
      _class.link = `/student/join-class/${_class.id}?code=${_class.code}`
      return await this.classesRepo.save(_class)
    } catch (error) {
      console.error(error)
    }
  }

  async getClassCount(user: User): Promise<number> {
    try {
      // Count classes that this user created
      let count = await this.classesRepo.count({
        where: { creator: user.UserID, isClosed: false, isDelete: false },
      })
      // Count classes that this user is a participant in as teacher
      count += await this.dataSource
        .createQueryBuilder(Class, 'c')
        .innerJoin(ClassParticipants, 'cp', 'c.id = cp.classid')
        .where('cp.userid = :userid', {
          userid: user.UserID,
        })
        .andWhere('c.isclosed = false and c.isdelete = false')
        .getCount()
      return count
    } catch (error) {
      console.error(error)
    }
  }

  async getClassesByOffset(
    user: User,
    offset: number,
    limit: number
  ): Promise<Class[]> {
    try {
      // Get classes that this user is a creator or a participant in as teacher
      return await this.dataSource
        .getRepository(Class)
        .createQueryBuilder('c')
        .select([
          'distinct c.id as id',
          'c.name as name',
          'c.description as description',
          'c.createtime as createtime'
        ])
        .leftJoin(ClassParticipants, 'cp', 'c.id = cp.classid')
        .where('c.creator = :userid or cp.userid = :userid', {
          userid: user.UserID,
        })
        .andWhere('c.isclosed = false and c.isdelete = false')
        .orderBy('createtime', 'DESC')
        .skip(offset)
        .take(limit)
        .getRawMany()
    } catch (error) {
      console.error(error)
    }
  }

  async getClassDetails(classID: string): Promise<Class> {
    try {
      return await this.classesRepo.findOne({
        select: {
          name: true,
          description: true,
          code: true,
          link: true,
        },
        where: {
          id: classID,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  async getClassPeople(classID: string): Promise<any> {
    try {
      // Get creator
      const creator = await this.dataSource
        .createQueryBuilder(Class, 'c')
        .select('u.fullname as fullname')
        .innerJoin(User, 'u', 'c.creator = u.userid')
        .where('c.classid = :classid', { classid: classID })
        .getRawMany()

      // Get teacher list
      const teachers = await this.dataSource
        .createQueryBuilder(ClassParticipants, 'cp')
        .select('u.fullname as fullname')
        .innerJoin(User, 'u', 'cp.userid = u.userid')
        .where('cp.classid = :classid', { classid: classID })
        .andWhere('u.role = :role', { role: UserRole.Teacher })
        .getRawMany()

      // Get student list
      const students = await this.dataSource
        .createQueryBuilder(ClassParticipants, 'cp')
        .select('u.fullname as fullname')
        .innerJoin(User, 'u', 'cp.userid = u.userid')
        .where('cp.classid = :classid', { classid: classID })
        .andWhere('u.role = :role', { role: UserRole.Student })
        .getRawMany()

      return { creator: creator, teachers: teachers, students: students }
    } catch (error) {
      console.log(error)
    }
  }

  async addClassPeople(email: string, classID: string): Promise<any> {
    try {
      const { UserID } = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .where(`user.email = :email`, { email: email })
        .getOneOrFail()

      // Check if UserID is creator of class
      const count = await this.dataSource
        .getRepository(Class)
        .createQueryBuilder('class')
        .where('class.classid = :classid and class.creator = :userid', {
          classid: classID,
          userid: UserID,
        })
        .getCount()
      if (count) {
        throw new BadRequestException()
      }

      return await this.dataSource.getRepository(ClassParticipants).insert({
        classID: classID,
        userID: UserID,
      })
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        // Not found email
        throw new NotFoundException('Email not found')
      }
      if (
        error instanceof BadRequestException ||
        error.code == 'ER_DUP_ENTRY'
      ) {
        // This user is a creator of this class or already in this class
        throw new BadRequestException('This user is already in class')
      }
    }
  }

  async getGradeCompositionsByClassID(
    classID: string
  ): Promise<GradeComposition[]> {
    return await this.gradeCompositionRepo.findBy({ classID })
  }

  async updateGradeCompositions(
    classID: string,
    compositions: GradeComposition[]
  ): Promise<any> {
    const existingCompositions = await this.gradeCompositionRepo.find({
      where: { classID },
    })
    const updatedCompositions = []
    const gpNames = []

    for (const existingComposition of existingCompositions) {
      const foundIndex = compositions.findIndex(
        (comp) => comp.id === existingComposition.id
      )

      if (foundIndex === -1) {
        await this.gradeCompositionRepo.remove(existingComposition)
      } else {
        const updatedComposition = compositions[foundIndex]

        // Create noti
        if (existingComposition.isFinalized != updatedComposition.isFinalized) {
          gpNames.push(existingComposition.name)
        }

        existingComposition.name = updatedComposition.name
        existingComposition.scale = updatedComposition.scale
        existingComposition.order = updatedComposition.order
        existingComposition.isFinalized = updatedComposition.isFinalized

        const updated =
          await this.gradeCompositionRepo.save(existingComposition)
        updatedCompositions.push(updated)
      }
    }

    for (const composition of compositions) {
      const existingComposition = await this.gradeCompositionRepo.findOne({
        where: { id: composition.id },
      })
      if (!existingComposition) {
        const newComposition = this.gradeCompositionRepo.create({
          classID: classID,
          name: composition.name,
          scale: composition.scale,
          order: composition.order,
        })

        const saved = await this.gradeCompositionRepo.save(newComposition)
        updatedCompositions.push(saved)
      }
    }

    // Start the notification process asynchronously
    this.notificationService.createGPFinalizedNotification(gpNames, classID)
    return updatedCompositions
  }

  async uploadClassStudentList(
    classStudentList: ClassStudentList[]
  ): Promise<any> {
    try {
      await Promise.all(
        classStudentList.map((classStudent) =>
          this.classStudentListRepo.save(classStudent)
        )
      )
      return 'Upload completed'
    } catch (exception) {
      return 'Upload fail'
    }
  }

  async getClassStudentList(classID: string): Promise<ClassStudentList[]> {
    return await this.classStudentListRepo.findBy({ classID })
  }

  async getClassStudentAccountList(classID: string): Promise<User[]> {
    try {
      const classStudentList = await this.classStudentListRepo.findBy({
        classID,
      })

      const classStudentAccountListPromises = classStudentList.map(
        async (classStudent) => {
          const studentID = classStudent.id
          const students = await this.studentRepo.findBy({ studentID })

          return students.map((student) => ({
            ...student,
            studentID,
          }))
        }
      )

      const classStudentAccountList = await Promise.all(
        classStudentAccountListPromises
      )

      const flattenedClassStudentAccountList = classStudentAccountList.flat()

      const accountListPromises = flattenedClassStudentAccountList.map(
        async (classStudent) => {
          const UserID = classStudent.id
          const users = await this.userRepo.findBy({ UserID })

          return users.map((user) => ({
            ...user,
            studentID: classStudent.studentID,
          }))
        }
      )

      const accountList = await Promise.all(accountListPromises)

      const flattenedAccountList = accountList.flat()

      return flattenedAccountList
    } catch (error) {
      console.error('Error fetching grades:', error)
      throw error
    }
  }

  async updateGradeForSpecificAssignemnt(gradeList: Grade[]): Promise<any> {
    try {
      const promises = gradeList.map(async (grade) => {
        const existingGrade = await this.gradeRepo.findOne({
          where: {
            gradeCompositionID: grade.gradeCompositionID,
            studentID: grade.studentID,
          },
        })

        if (existingGrade) {
          await this.gradeRepo.update(
            {
              gradeCompositionID: existingGrade.gradeCompositionID,
              studentID: existingGrade.studentID,
            },
            {
              grade: grade.grade,
            }
          )
        } else {
          await this.gradeRepo.save(grade)
        }
      })

      await Promise.all(promises)
      return 'Upload completed'
    } catch (exception) {
      return 'Upload fail'
    }
  }

  async getGradeByClassID(classID: string): Promise<Grade[]> {
    try {
      const gradeCompositionList = await this.gradeCompositionRepo.findBy({
        classID,
      })

      const gradePromises = gradeCompositionList.map(
        async (gradeComposition) => {
          const gradeCompositionID = gradeComposition.id
          const grades = await this.gradeRepo.findBy({ gradeCompositionID })
          return grades
        }
      )

      const allGrades = await Promise.all(gradePromises)
      const flattenedGrades = allGrades.flat()

      return flattenedGrades
    } catch (error) {
      console.error('Error fetching grades:', error)
      throw error
    }
  }

  async updateOverallGrade(overallGradeList: OverallGrade[]): Promise<any> {
    try {
      const promises = overallGradeList.map(async (grade) => {
        const existingGrade = await this.overallGradeRepo.findOne({
          where: {
            classID: grade.classID,
            studentID: grade.studentID,
          },
        })

        if (existingGrade) {
          await this.overallGradeRepo.update(
            {
              classID: existingGrade.classID,
              studentID: existingGrade.studentID,
            },
            {
              grade: grade.grade,
            }
          )
        } else {
          await this.overallGradeRepo.save(grade)
        }
      })

      await Promise.all(promises)
      return 'Upload completed'
    } catch (exception) {
      return 'Upload fail'
    }
  }

  async getOverallGradeByClassID(classID: string): Promise<OverallGrade[]> {
    return await this.overallGradeRepo.findBy({ classID })
  }

  async getGradeReviewsByClassID(classID: string): Promise<any[]> {
    try {
      const gradeCompositions = await this.gradeCompositionRepo.find({
        where: { classID },
      })

      const gradeCompositionIDs = gradeCompositions.map(
        (composition) => composition.id
      )
      const gradeReviews = await this.gradeReviewRepo.find({
        where: { gradeCompositionID: In(gradeCompositionIDs) },
      })

      const studentIDs = gradeReviews.map((review) => review.userID)
      const students = await this.studentRepo.find({
        where: { id: In(studentIDs) },
      })

      const studentIDMap = new Map(
        students.map((student) => [student.id, student.studentID])
      )

      const result = gradeReviews.map((review) => ({
        ...review,
        gradeCompositionName:
          gradeCompositions.find(
            (comp) => comp.id === review.gradeCompositionID
          )?.name || '',
        studentID: studentIDMap.get(review.userID) || '',
      }))

      result.sort((a, b) => {
        if (a.isFinal !== b.isFinal) {
          return a.isFinal ? 1 : -1
        }
        return (
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        )
      })

      return result
    } catch (error) {
      console.error('Error fetching grade reviews by class ID:', error)
      throw error
    }
  }

  async getGradeReviewDetail(
    gradeCompositionID: string,
    userID: string
  ): Promise<any> {
    try {
      const gradeComposition = await this.gradeCompositionRepo.findOne({
        where: { id: gradeCompositionID },
      })
      const student = await this.studentRepo.findOne({ where: { id: userID } })
      const user = await this.userRepo.findOne({ where: { UserID: userID } })
      const gradeReview = await this.gradeReviewRepo.findOne({
        where: { gradeCompositionID, userID },
      })

      const result = {
        gradeCompositionName: gradeComposition?.name || '',
        studentID: student?.studentID || '',
        userFullName: user?.fullname || '',
        currentGrade: gradeReview?.currentGrade || null,
        expectedGrade: gradeReview?.expectationGrade || null,
        updatedGrade: gradeReview?.updatedGrade || null,
        explanation: gradeReview?.explanation || null,
        isFinal: gradeReview?.isFinal || false,
      }

      return result
    } catch (error) {
      console.error('Error fetching grade review detail:', error)
      throw error
    }
  }

  async updateGradeReviewDetail(updateData: any): Promise<any> {
    try {
      const { gradeCompositionID, userID, updatedGrade, isFinal } = updateData

      // 1. Find studentID in the students table using userID
      const student = await this.studentRepo.findOne({ where: { id: userID } })
      if (!student) {
        return { message: 'Student not found.' }
      }
      const { studentID } = student

      // 2. Find classID in grade_compositions table using gradeCompositionID
      const gradeComposition = await this.gradeCompositionRepo.findOne({
        where: { id: gradeCompositionID },
      })
      if (!gradeComposition) {
        return { message: 'Grade composition not found.' }
      }
      const { classID } = gradeComposition

      // 3. Update grade in the grades table
      const grade = await this.gradeRepo.findOne({
        where: { studentID, gradeCompositionID },
      })
      if (!grade) {
        return { message: 'Grade not found.' }
      }
      grade.grade = updatedGrade
      await this.gradeRepo.save(grade)

      // 4. Update overall grade in the overall_grades table
      const gradeCompositionsOfClass = await this.gradeCompositionRepo.find({
        where: { classID },
      })

      const gradesOfStudent = await this.gradeRepo.find({
        where: {
          studentID,
          gradeCompositionID: In(gradeCompositionsOfClass.map((gc) => gc.id)),
        },
      })

      // Calculate overall grade
      let totalWeightedGrade = 0

      for (const grade of gradesOfStudent) {
        const matchingComposition = gradeCompositionsOfClass.find(
          (gc) => gc.id === grade.gradeCompositionID
        )
        if (matchingComposition) {
          const { scale } = matchingComposition
          totalWeightedGrade += grade.grade * scale
        }
      }

      const overallGrade = totalWeightedGrade / 100

      // Update overall grade in the overall_grades table
      const overallGradeEntry = await this.overallGradeRepo.findOne({
        where: { classID, studentID },
      })
      if (overallGradeEntry) {
        overallGradeEntry.grade = overallGrade
        await this.overallGradeRepo.save(overallGradeEntry)
      }

      // Update grade review details
      const gradeReview = await this.gradeReviewRepo.findOne({
        where: { gradeCompositionID, userID },
      })

      if (!gradeReview) {
        return { message: 'Grade review details not found.' }
      }

      gradeReview.updatedGrade = updatedGrade
      gradeReview.isFinal = isFinal

      await this.gradeReviewRepo.save(gradeReview)

      // Save notification
      this.notificationService.createFinalMarkReviewNotification(
        userID,
        gradeCompositionID
      )

      return {
        message: 'Grade review details and related data updated successfully.',
        ...gradeReview,
      }
    } catch (error) {
      console.error('Error updating grade review detail:', error)
      throw error
    }
  }

  async getGradeReviewComments(
    gradeCompositionID: string,
    userID: string
  ): Promise<any> {
    try {
      const comments = await this.gradeReviewCommentRepo.find({
        where: { gradeCompositionID: gradeCompositionID, userID: userID },
        order: { createTime: 'ASC' },
      })

      const authorIDs = comments.map((comment) => comment.authorID)
      const users = await this.userRepo.find({
        where: { UserID: In(authorIDs) },
      })

      const result = {
        comments: comments.map((comment) => {
          const author = users.find((user) => user.UserID === comment.authorID)
          return {
            commentID: comment.commentID,
            userID: comment.userID,
            authorName: author?.fullname,
            createTime: comment.createTime,
            commentContent: comment.commentContent,
          }
        }),
      }

      return result
    } catch (error) {
      console.error('Error fetching grade review detail:', error)
      throw error
    }
  }

  async addGradeReviewComment(
    gradeCompositionID: string,
    userID: string,
    authorID: string,
    commentContent: string
  ): Promise<any> {
    try {
      const newComment = await this.gradeReviewCommentRepo.create({
        gradeCompositionID: gradeCompositionID,
        userID: userID,
        authorID: authorID,
        commentContent: commentContent,
      })
      await this.gradeReviewCommentRepo.save(newComment)

      // Save notification
      this.notificationService.createTeacherReplyNotification(
        userID,
        gradeCompositionID
      )

      return newComment
    } catch (error) {
      console.error('Error adding grade review comment:', error)
      throw error
    }
  }
}
