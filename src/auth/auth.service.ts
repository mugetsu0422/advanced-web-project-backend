import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) { }


  async signIn(username, password): Promise<any> {
    const user = await this.userService.findOneByUserName(username)

    if (!user) {
      // User not found, handle accordingly
      throw new UnauthorizedException()
    }

    const isMatch = await bcrypt.compareSync(password, user?.password.toString())

    if (isMatch) {
      const payload = { sub: user.UserID, username: user.username }
      return {
        access_token: await this.jwtService.signAsync(payload),
      }
    } else {
      throw new UnauthorizedException()
    }
  }
}
