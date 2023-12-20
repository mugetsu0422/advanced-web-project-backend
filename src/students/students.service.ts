import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ClassParticipants } from 'src/entity/class-participants.entity'
import { Class } from 'src/entity/classes.entity'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { User } from 'src/entity/users.entity'
import { UserRole } from 'src/model/role.enum'
import { DataSource, EntityNotFoundError } from 'typeorm'

@Injectable()
export class StudentsService {
  constructor(private readonly dataSource: DataSource) {}

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
        .orderBy('c.createtime', 'DESC')
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
}
