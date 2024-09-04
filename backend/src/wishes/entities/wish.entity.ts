import { Entity, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { Length, IsUrl, IsOptional, Min } from 'class-validator';

import { Shared } from '../../shared';
import { User } from '../../users/entities/user.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';
import { Offer } from '../../offers/entities/offer.entity';

@Entity()
export class Wish extends Shared.BaseColumns {
  @Column()
  @Length(1, 250)
  name: string;

  @Column()
  @IsUrl()
  link: string;

  @Column()
  @IsUrl()
  image: string;

  @Column('decimal')
  @Min(1)
  price: number;

  @Column('decimal', { default: 0 })
  raised: number;

  @Column({ default: 'Пока нет описания' })
  @Length(1, 1024)
  @IsOptional()
  description: string;

  @Column({ default: 0 })
  copied: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlist: Wishlist[];
}
