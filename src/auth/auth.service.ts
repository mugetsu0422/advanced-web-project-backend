import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUserName(username)

    if (!user) {
      // User not found, handle accordingly
      throw new UnauthorizedException()
    }

    const isMatch = await bcrypt.compareSync(
      password,
      user?.password.toString()
    )

    if (isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user
      return result
    }
    return null
  }

  async generateJWtToken(user: any) {
    const payload = { sub: user.UserID, username: user.username }
    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}
