import { IsOptional, IsUrl, Length } from 'class-validator';
import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

import { Shared } from '../../shared';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Wishlist extends Shared.BaseColumns {
  @Column()
  @Length(1, 250)
  name: string;

  @Column({ default: 'Пока нет отписания' })
  @Length(0, 1500)
  @IsOptional()
  description: string;

  @Column()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.wishlist)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;
}
