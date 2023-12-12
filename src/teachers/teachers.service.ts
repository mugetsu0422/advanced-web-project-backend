import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Class } from 'src/entity/classes.entity'
import { User } from 'src/entity/users.entity'
import { v4 as uuidv4 } from 'uuid'
import { ClassParticipants } from 'src/entity/class-participants.entity'

@Injectable()
export class TeachersService {
  constructor(
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
}
