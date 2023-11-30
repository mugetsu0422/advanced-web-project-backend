import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from 'src/users/users.service'
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from 'src/model/role.enum';
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private userService: UsersService, configService: ConfigService,) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/google/callback',
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    // Perform custom validation or save user to database
    let user = await this.userService.findOneByGoogleID(profile.id)
    if (!user) {
      user = { UserID: uuidv4(), username: profile.id, password: null, fullname: profile.displayName, googleID: profile.id, facebookID: '', email: profile.emails[0].value, phone: '', address: '', role: UserRole.Student, createTime: new Date(), isActivated: false, isLocked: false, isDelete: false }
      this.userService.create(user)
    }
    return done(null, profile);
  }
}