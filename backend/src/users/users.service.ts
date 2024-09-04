import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    try {
      const newUser = await this.userRepository.save({
        ...createUserDto,
        password: hashedPassword,
      });

      delete newUser.password;

      return newUser;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;

        if (err.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username существует',
          );
        }
      }
    }
  }

  async getUserById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async getCurrentUserWishes(userId: number) {
    console.log(typeof userId, userId);
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        wishes: true,
      },
    });

    console.log('user', user);

    return user.wishes;
  }

  async getUserByName(username: string) {
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        password: true,
        username: true,
        about: true,
      },
      where: {
        username,
      },
    });

    return user;
  }

  async getWishesByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
      relations: {
        wishes: true,
        offers: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Пользователь с таким username не найден');
    }

    return user.wishes;
  }

  async findManyUsers(query: string) {
    const users = await this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
    return users;
  }

  async findOneUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async updateUser(updateUserDto: UpdateUserDto, userId: number) {
    const userToUpdate = await this.userRepository.findOne({
      select: {
        id: true,
        username: true,
        about: true,
        avatar: true,
        email: true,
        password: true,
      },
      where: {
        id: userId,
      },
    });

    for (const key in updateUserDto) {
      if (key === 'password') {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(updateUserDto[key], salt);
        userToUpdate[key] = hash;
      } else {
        userToUpdate[key] = updateUserDto[key];
      }
    }

    try {
      const user = await this.userRepository.save(userToUpdate);
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;

        if (err.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username существует',
          );
        }
      }
    }
  }

  async getUserWishes(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: {
        wishes: true,
      },
    });
    return user.wishes;
  }
}
