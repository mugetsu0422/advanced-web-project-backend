import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Users } from 'src/entity/users.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>
  ) {}

  async findOne(UserID: string): Promise<Users> {
    return await this.usersRepo.findOneBy({ UserID })
  }
}
