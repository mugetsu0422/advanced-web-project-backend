import { InjectRepository } from '@nestjs/typeorm'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ClassParticipants } from 'src/entity/class-participants.entity'
import { Class } from 'src/entity/classes.entity'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { User } from 'src/entity/users.entity'
import { Student } from 'src/entity/students.entity'
import { UserRole } from 'src/model/role.enum'
import { DataSource, EntityNotFoundError, In, Repository } from 'typeorm'
import { Grade } from 'src/entity/grades.entity'
import { GradeReview } from 'src/entity/grade-reviews.entity'
import { GradeReviewComment } from 'src/entity/grade-review-comments.entity'

@Injectable()
export class StudentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(GradeComposition)
    private readonly gradeCompositionRepo: Repository<GradeComposition>,
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(GradeReview)
    private readonly gradeReviewRepo: Repository<GradeReview>,
    @InjectRepository(GradeReviewComment)
    private readonly gradeReviewCommentRepo: Repository<GradeReviewComment>
  ) {}

  async getClassCount(user: User): Promise<number> {
    try {
      // Count classes that this user is a participant in as student
      return await this.dataSource
        .createQueryBuilder(ClassParticipants, 'cp')
        .innerJoin(Class, 'c', 'c.id = cp.classid')
        .where('cp.userid = :userid', { userid: user.UserID })
        .andWhere('c.isclosed = false and c.isdelete = false')
        .getCount()
    } catch (error) {
      console.error(error)
      throw new BadRequestException()
    }
  }

  async getClassesByOffset(
    user: User,
    offset: number,
    limit: number
  ): Promise<Class[]> {
    try {
      // Count classes that this user is a participant in as student
      return await this.dataSource
        .getRepository(Class)
        .createQueryBuilder('c')
        .select([
          'c.id as id',
          'c.name as name',
          'c.description as description',
          'u.fullname as creator',
        ])
        .innerJoin(ClassParticipants, 'cp', 'c.classid = cp.classid')
        .innerJoin(User, 'u', 'c.creator = u.userid')
        .where('cp.userid = :userid', { userid: user.UserID })
        .andWhere('c.isclosed = false and c.isdelete = false')
        .orderBy('c.createtime', 'DESC')
        .skip(offset)
        .take(limit)
        .getRawMany()
    } catch (error) {
      console.error(error)
      throw new BadRequestException()
    }
  }

  async getClassDetails(classID: string): Promise<Class> {
    try {
      return await this.dataSource
        .getRepository(Class)
        .createQueryBuilder('c')
        .select([
          'c.name as name',
          'c.description as description',
          'u.fullname as creator',
        ])
        .innerJoin(User, 'u', 'c.creator = u.userid')
        .where('c.id = :id', { id: classID })
        .getRawOne()
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

  async getGradeCompositionsByClassID(
    classID: string
  ): Promise<GradeComposition[]> {
    try {
      return await this.dataSource
        .createQueryBuilder(GradeComposition, 'gp')
        .select(['gp.name', 'gp.scale'])
        .where('gp.classid = :id', { id: classID })
        .andWhere('gp.isdelete = false')
        .orderBy('gp.order', 'ASC')
        .getMany()
    } catch (error) {
      console.error(error)
    }
  }

  async joinClassByCode(code: string, userid: string): Promise<string> {
    try {
      const { id: classID } = await this.dataSource
        .createQueryBuilder(Class, 'c')
        .where('c.code = :code', { code: code })
        .getOneOrFail()
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(ClassParticipants)
        .values([{ classID: classID, userID: userid }])
        .execute()
      return classID
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Invitation code is not correct')
      }
      if (
        error instanceof BadRequestException ||
        error.code == 'ER_DUP_ENTRY'
      ) {
        throw new BadRequestException('Already joined class')
      }
    }
  }

  async checkInvitationLink(classid: string, code: string): Promise<Class> {
    try {
      return await this.dataSource
        .createQueryBuilder(Class, 'c')
        .select(['c.name'])
        .where('c.id = :id and c.code = :code', { id: classid, code: code })
        .andWhere('c.isclosed = false and c.isdelete = false')
        .getOneOrFail()
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Class not found')
      }
    }
  }

  async getStudentIDByUserID(UserID: string): Promise<any> {
    try {
      return await this.studentRepo.findOne({ where: { id: UserID } })
    } catch (error) {
      console.error('Error fetching student ID:', error)
      throw error
    }
  }

  async mapStudentID(UserID: string, studentId: string): Promise<any> {
    try {
      const existingStudent = await this.studentRepo.findOne({
        where: { studentID: studentId },
      })
      if (existingStudent) {
        return {
          success: false,
          message: 'Student ID is already mapped to an account',
        }
      }

      const newStudent = this.studentRepo.create({
        id: UserID,
        studentID: studentId,
      })

      await this.studentRepo.save(newStudent)

      return { success: true, message: 'Student ID mapped successfully' }
    } catch (error) {
      return { success: false, message: 'Error mapping student ID' }
    }
  }

  async getGradeByClassIDAndUserID(
    ClassID: string,
    UserID: string
  ): Promise<any> {
    try {
      // Get grade compositions list of that class
      const gradeCompositions = await this.gradeCompositionRepo.findBy({
        classID: ClassID,
      })

      // Get studentID by UserID
      const student = await this.studentRepo.findOne({ where: { id: UserID } })

      // Initialize result set
      const resultSet = []

      // Iterate through grade compositions
      for (const composition of gradeCompositions) {
        const {
          id: gradeCompositionID,
          name,
          scale,
          order,
          isFinalized,
        } = composition
        let grades = []
        let gradeReview = null

        // Fetch all grade of that student for finalized compositions
        if (isFinalized) {
          // Check if student exists
          if (student) {
            grades = await this.gradeRepo.findBy({
              gradeCompositionID: gradeCompositionID,
              studentID: student.studentID,
            })

            gradeReview = await this.gradeReviewRepo.findOneBy({
              userID: UserID,
              gradeCompositionID: gradeCompositionID,
            })
          }
        }
        // Push to result set
        resultSet.push({
          gradeCompositionID,
          name,
          scale,
          grade: isFinalized && grades.length > 0 ? grades[0].grade : null,
          order,
          isFinalized,
          review: isFinalized && gradeReview ? gradeReview : null,
        })
      }

      resultSet.sort((a, b) => a.order - b.order)

      return {
        success: true,
        student: student ? student.studentID : null,
        grades: resultSet,
        message: 'Get student grade successfully',
      }
    } catch (error) {
      return { success: false, message: 'Error getting student grade' }
    }
  }

  async addGradeReview(
    userID: string,
    gradeReviewDetail: any
  ): Promise<any> {
    try {
      const {
        GradeCompositionID,
        CurrentGrade,
        ExpectationGrade,
        Explanation,
      } = gradeReviewDetail

      const newGradeReview = this.gradeReviewRepo.create({
        gradeCompositionID: GradeCompositionID,
        userID: userID,
        currentGrade: CurrentGrade,
        expectationGrade: ExpectationGrade,
        explanation: Explanation,
      })

      await this.gradeReviewRepo.save(newGradeReview)

      return {
        success: true,
        message: 'Grade review details added successfully',
      }
    } catch (error) {
      console.log(error)
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

      //add noti

      return newComment
    } catch (error) {
      console.error('Error adding grade review comment:', error)
      throw error
    }
  }
}
