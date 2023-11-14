import { Controller, Post, Get, Put , Param, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from 'src/entity/users.entity'

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() user: User) {
    return this.userService.create(user)
  }

  @Get(':userID')
  async getUserById(@Param('userID') userID: string): Promise<User> {
    return this.userService.findOneByUserID(userID);
  }

  @Put(':userID')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserById(@Param('userID') userID: string, @Body() updatedUser: User): Promise<void> {
    await this.userService.updateUser(userID, updatedUser);
  }

  @Post('change-password')
  async changePassword(@Body() changePasswordDto: { userId: string; oldPassword: string; newPassword: string }): Promise<any> {
    return this.userService.changePassword(changePasswordDto.userId, changePasswordDto.oldPassword, changePasswordDto.newPassword);
  }
}
