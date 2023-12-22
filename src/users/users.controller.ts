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
  BadRequestException,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { MailingService } from '../mailing/mailing.service'
import { ConfigService } from '@nestjs/config'
import { User } from 'src/entity/users.entity'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { generateTokenFromEmail } from '../mailing/TokenUtils'

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly mailingService: MailingService,
    private readonly configService: ConfigService
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() user: User) {
    return this.userService.create(user)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userID')
  async getUserById(@Param('userID') userID: string): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } =
      await this.userService.findOneByUserID(userID)
    return result
  }

  @UseGuards(JwtAuthGuard)
  @Put(':userID')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserById(
    @Param('userID') userID: string,
    @Body() updatedUser: User
  ): Promise<void> {
    return await this.userService.updateUser(userID, updatedUser)
  }

  @UseGuards(JwtAuthGuard)
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

  @Post('request-reset-password')
  async sendResetPasswordLink(
    @Body() { email }: { email: string }
  ): Promise<any> {
    const user = await this.userService.findOneByUserEmail(email)
    if (user && user.isActivated) {
      const token = generateTokenFromEmail(email)
      const clientUrl = this.configService.get<string>('CLIENT_URL')
      const resetLink = `${clientUrl}forget-password/${token}`
      await this.userService.storePasswordResetToken(user.UserID, token)
      await this.mailingService.sendResetEmail(email, resetLink)
      return { message: 'Reset instructions sent successfully' }
    } else {
      throw new BadRequestException('User not found or account not activated')
    }
  }

  @Post('set-new-password')
  async setNewPassword(
    @Body() { token, newPassword }: { token: string; newPassword: string }
  ): Promise<any> {
    const user = await this.userService.findUserByToken(token)

    if (user) {
      await this.userService.updateUserPassword(user.UserID, newPassword)
      return { message: 'Password updated successfully' }
    } else {
      throw new BadRequestException('Invalid or expired token')
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-activation-code/:userID')
  async sendActivationCode(@Param('userID') userID: string): Promise<any> {
    try {
      const activationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString()
      await this.userService.saveActivationCode(userID, activationCode)
      const user = await this.userService.findOneByUserID(userID)
      await this.mailingService.sendActivationCode(user.email, activationCode)
      return { message: 'Activation code sent successfully!' }
    } catch (error) {
      throw new BadRequestException('Error sending activation code')
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-activation-code')
  async verifyActivationCode(
    @Body()
    { activationCode, userId }: { activationCode: string; userId: string }
  ): Promise<any> {
    try {
      const isActivated = await this.userService.activateUser(
        userId,
        activationCode
      )
      return { isActivated }
    } catch (error) {
      console.error('Error verifying activation code:', error.message)
      throw new BadRequestException('Error verifying activation code')
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-role-social-login')
  async updateRoleSocialLogin(
    @Body() { socialToken, role }: { socialToken: string; role: string }
  ): Promise<any> {
    let user = await this.userService.findOneByGoogleID(socialToken)
    let success = false
    if (user !== null) {
      success = await this.userService.updateRole(user.UserID, role)
      return { success }
    } else {
      user = await this.userService.findOneByFacebookID(socialToken)

      if (user !== null) {
        success = await this.userService.updateRole(user.UserID, role)
        return { success }
      }
    }
    return { success }
  }
}
