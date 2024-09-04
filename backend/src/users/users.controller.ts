import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
} from '@nestjs/common';

import { JwtGuard } from '../auth/jwt/jwt.guard';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@Req() req) {
    return this.usersService.getUserById(req.user.id);
  }

  @Patch('me')
  updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.usersService.updateUser(updateUserDto, req.user.id);
  }

  @Get('me/wishes')
  getCurrentUserWishes(@Req() req) {
    return this.usersService.getCurrentUserWishes(req.user.id);
  }

  @Post('find')
  findManyUsers(@Body('query') query: string) {
    return this.usersService.findManyUsers(query);
  }

  @Get(':username')
  getUserByName(@Param('username') username: string) {
    return this.usersService.getUserByName(username);
  }

  @Get(':username/wishes')
  getWishesByUsername(@Param('username') username: string) {
    return this.usersService.getWishesByUsername(username);
  }
}
