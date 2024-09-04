import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';

import { Wishlist } from './entities/wishlist.entity';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  private async validate(createWishlistDto: CreateWishlistDto) {
    const wishList = new Wishlist();
    for (const key in createWishlistDto) {
      wishList[key] = createWishlistDto[key];
    }
    const errors = await validate(wishList, { whitelist: true });
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return wishList;
  }

  async create(createWishlistDto: CreateWishlistDto, userId: number) {
    const { itemsId } = createWishlistDto;
    const items = itemsId.map((item): Wish | { id: number } => ({
      id: item,
    }));
    const wishList = await this.validate(createWishlistDto);
    const user = await this.userRepository.findOneBy({ id: userId });
    const wishes = await this.wishRepository.find({
      where: items,
    });

    wishList.owner = user;
    wishList.items = wishes;

    return this.wishlistRepository.save(wishList);
  }

  getAllWishlists() {
    return this.wishlistRepository.find();
  }

  getWishListById(id: number) {
    return this.wishlistRepository.findOne({
      relations: {
        items: true,
        owner: true,
      },
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });

    for (const key in updateWishlistDto) {
      if (key === 'itemsId') {
        const items = updateWishlistDto[key].map(
          (item): Wish | { id: number } => ({
            id: item,
          }),
        );

        const wishes = await this.wishRepository.find({
          where: items,
        });

        wishList.items = wishes;
      } else {
        wishList[key] = updateWishlistDto[key];
      }
    }

    return this.wishlistRepository.save(wishList);
  }

  async remove(id: number, userId: number) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });

    return await this.wishlistRepository.remove(wishList);
  }
}
