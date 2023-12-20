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
import { DataSource, EntityNotFoundError, Repository } from 'typeorm'
import { Class } from 'src/entity/classes.entity'
import { v4 as uuidv4 } from 'uuid'
import { ClassParticipants } from 'src/entity/class-participants.entity'
import { UserRole } from 'src/model/role.enum'

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
    private readonly overallGradeRepo: Repository<OverallGrade>
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
      _class.link = `/student/class/${_class.id}?code=${_class.code}`
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
        ])
        .leftJoin(ClassParticipants, 'cp', 'c.id = cp.classid')
        .where('c.creator = :userid or cp.userid = :userid', {
          userid: user.UserID,
        })
        .andWhere('c.isclosed = false and c.isdelete = false')
        .orderBy('c.createtime', 'DESC')
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

    for (const existingComposition of existingCompositions) {
      const foundIndex = compositions.findIndex(
        (comp) => comp.id === existingComposition.id
      )

      if (foundIndex === -1) {
        await this.gradeCompositionRepo.remove(existingComposition)
      } else {
        const updatedComposition = compositions[foundIndex]
        existingComposition.name = updatedComposition.name
        existingComposition.scale = updatedComposition.scale
        existingComposition.order = updatedComposition.order

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
}
