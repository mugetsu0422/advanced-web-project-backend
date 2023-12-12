import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityNotFoundError, Repository } from 'typeorm'
import { Class } from 'src/entity/classes.entity'
import { User } from 'src/entity/users.entity'
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
    private readonly classParticipantsRepo: Repository<ClassParticipants>
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
      return await this.classesRepo.count({
        where: { creator: user.UserID },
      })
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
      return await this.classesRepo.find({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: { creator: user.UserID },
        order: {
          createTime: 'DESC',
        },
        skip: offset,
        take: limit,
      })
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
        .leftJoin(User, 'u', 'c.creator = u.userid')
        .where('c.classid = :classid', { classid: classID })
        .getRawMany()

      // Get teacher list
      const teachers = await this.dataSource
        .createQueryBuilder(ClassParticipants, 'cp')
        .select('u.fullname as fullname')
        .leftJoin(User, 'u', 'cp.userid = u.userid')
        .where('cp.classid = :classid', { classid: classID })
        .andWhere('u.role = :role', { role: UserRole.Teacher })
        .getRawMany()

      // Get student list
      const students = await this.dataSource
        .createQueryBuilder(ClassParticipants, 'cp')
        .select('u.fullname as fullname')
        .leftJoin(User, 'u', 'cp.userid = u.userid')
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
}
