import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
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
}
