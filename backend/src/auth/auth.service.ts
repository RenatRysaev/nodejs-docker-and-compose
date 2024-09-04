import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };

    return { access_token: this.jwtService.sign(payload, { expiresIn: '7d' }) };
  }

  public async validatePassword(username: string, password: string) {
    const user = await this.userService.getUserByName(username);

    if (user) {
      const isMatchPasswords = await bcrypt.compare(password, user.password);
      if (isMatchPasswords) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: userPassword, ...result } = user;
        return result;
      }
    }

    return null;
  }
}
