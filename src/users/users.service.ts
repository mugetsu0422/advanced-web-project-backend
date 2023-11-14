import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/entity/users.entity'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

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
  async updateUser(userID: string, updatedUser: Partial<User>): Promise<void> {
    try {
      const { username } = updatedUser;
  
      if (username !== undefined && username.trim() !== '') {
        const existingUserWithUsername = await this.usersRepo.findOne({ where: { username } });
  
        if (!existingUserWithUsername || existingUserWithUsername.UserID === userID) {
          await this.usersRepo.update({ UserID: userID }, updatedUser);
        } else {
          throw new BadRequestException(`Username '${username}' already exists.`);
        }
      } else {
        throw new BadRequestException('Username cannot be blank.');
      }
    } catch (exception) {
      console.log(exception);
      throw new BadRequestException(`Error updating user with ID ${userID}`);
    }
  }
  async changePassword(UserID, oldPassword, newPassword): Promise<any> {
    const user = await this.usersRepo.findOneBy( { UserID });

    const isMatch = await bcrypt.compareSync(oldPassword, user?.password.toString());
    if (isMatch) {
      await this.usersRepo.update({ UserID: UserID }, { password: newPassword });
      return { message: 'Password updated successfully' };
    } else {
      throw new BadRequestException(`Old password incorrect`);
    }
  }
}
