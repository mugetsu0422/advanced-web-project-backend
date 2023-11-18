import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from 'src/entity/users.entity'
import { AuthGuard } from '@nestjs/passport'

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() user: User) {
    return this.userService.create(user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userID')
  async getUserById(@Param('userID') userID: string): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } =
      await this.userService.findOneByUserID(userID)
    return result
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':userID')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserById(
    @Param('userID') userID: string,
    @Body() updatedUser: User
  ): Promise<void> {
    return await this.userService.updateUser(userID, updatedUser)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(
    @Body()
    changePasswordDto: {
      userId: string
      oldPassword: string
      newPassword: string
    }
  ): Promise<any> {
    return await this.userService.changePassword(
      changePasswordDto.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword
    )
  }
}
