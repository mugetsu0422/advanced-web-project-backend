import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { AuthService } from './auth.service'


@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password)
  }

  //   @UseGuards(AuthGuard)
  //   @Get('profile')
  //   getProfile(@Request() req) {
  //     return req.user
  //   }
}
