import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { OffsetWithoutLimitNotSupportedError, Repository } from 'typeorm'
import { Class } from 'src/entity/classes.entity'
import { User } from 'src/entity/users.entity'

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepo: Repository<Class>
  ) {}

  async createClass(_class: Class) {
    try {
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
}
