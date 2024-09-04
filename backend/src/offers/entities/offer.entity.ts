import { IsBoolean, IsNumber } from 'class-validator';
import { Entity, Column, ManyToOne } from 'typeorm';

import { Shared } from '../../shared';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Offer extends Shared.BaseColumns {
  @Column('decimal')
  @IsNumber()
  amount: number;

  @Column()
  @IsBoolean()
  hidden: boolean;

  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  item: Wish;
}
