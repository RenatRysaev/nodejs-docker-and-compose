import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';

import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  private async validate(createOfferDto: CreateOfferDto) {
    const offer = new Offer();
    for (const key in createOfferDto) {
      offer[key] = createOfferDto[key];
    }

    const errors = await validate(offer, { whitelist: true });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return offer;
  }

  async create(createOfferDto: CreateOfferDto, userId: number) {
    const { itemId, amount } = createOfferDto;
    const offer = await this.validate(createOfferDto);
    const user = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });
    const wish = await this.wishRepository.findOneBy({ id: itemId });

    if (!wish) {
      throw new BadRequestException('Нет подарка с таким id');
    }

    const isHasWish = user.wishes.some((item) => item.id === wish.id);
    if (!isHasWish) {
      offer.user = user;
      offer.item = wish;
      wish.raised = Number(wish.raised) + amount;

      if (wish.raised > wish.price) {
        throw new BadRequestException('Cумма превышает необходимую');
      }

      await this.wishRepository.save(wish);

      return this.offerRepository.save(offer);
    }

    throw new BadRequestException('На свои подарки не скидываемся');
  }

  getAllOffers() {
    return this.offerRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });
  }

  getOneOffer(id: number) {
    return this.offerRepository.findOneBy({ id });
  }
}
