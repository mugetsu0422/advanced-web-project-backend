import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/entity/users.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  async findOneByUserID(UserID: string): Promise<User> {
    return await this.usersRepo.findOneBy({ UserID })
  }

  async findOneByUserName(username: string): Promise<User> {
    return await this.usersRepo.findOneBy({ username })
  }

  async create(user: User): Promise<User> {
    try {
      return await this.usersRepo.save(user)
    } catch (exception) {
      console.log(exception)
      if (exception.code == 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          `User with ID ${user.UserID} already exists.`
        )
      }
    }
  }
}
