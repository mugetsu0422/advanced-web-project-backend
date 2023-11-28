// facebook.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service'
import { UserRole } from 'src/model/role.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private userService: UsersService,) {
    super({
      clientID: '863992918531033',
      clientSecret: 'b454ca2075501e543332576f79d55b76',
      callbackURL: 'http://localhost:4000/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name'],
      scope: ['email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    let user = await this.userService.findOneByFacebookID(profile.id)
    if (!user) {
      const fullName = [profile.name.familyName, profile.name.middleName, profile.name.givenName].filter(Boolean).join(' ');
      user = { UserID: uuidv4(), username: profile.id, password: null, fullname: fullName, googleID: '', facebookID: profile.id, email: profile.emails[0].value, phone: '', address: '', role: UserRole.Student, createTime: new Date(), isActivated: false, isLocked: false, isDelete: false }
      this.userService.create(user)
    }
    return done(null, profile);
  }
}
