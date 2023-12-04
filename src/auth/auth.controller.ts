import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Get,
  Res,
  Param,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { FacebookAuthGuard } from './guards/facebook-auth.guard'
import { Response } from 'express'
import { UsersService } from 'src/users/users.service'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private configService: ConfigService
  ) {}

  // Simple signin
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signIn(@Request() req) {
    return this.authService.generateJWtToken(req.user)
  }

  // Google signin
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleLoginCallback(@Request() req, @Res() res: Response) {
    const expires = new Date()
    expires.setDate(expires.getDate() + 1)
    if (req.user) {
      // Set user_id of google account to cookie
      res.cookie('socialToken', req.user.id, { expires })
    } else {
      res.cookie('socialToken', '', { expires })
    }
    return res.redirect(this.configService.get<string>('CLIENT_URL') + 'signin')
  }

  // Facebook signin
  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  facebookLogin() {}

  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  facebookLoginCallback(@Request() req, @Res() res: Response) {
    const expires = new Date()
    expires.setDate(expires.getDate() + 1)
    if (req.user) {
      // Set user_id of facebook account to cookie
      res.cookie('socialToken', req.user.id, { expires })
    } else {
      res.cookie('socialToken', '', { expires })
    }
    return res.redirect(this.configService.get<string>('CLIENT_URL') + 'signin')
  }

  @Get('signin/success/:socialToken')
  async loginSuccess(@Param('socialToken') socialToken: string) {
    let user = await this.userService.findOneByGoogleID(socialToken)

    if (user !== null) {
      return this.authService.generateJWtToken(user)
    } else {
      user = await this.userService.findOneByFacebookID(socialToken)

      if (user !== null) {
        return this.authService.generateJWtToken(user)
      }
    }
  }
}
