import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from 'src/order-item/order-tem.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  orderId: number;

  @ApiProperty()
  @Column()
  @ManyToOne(() => User, (customer) => customer.id, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  customer: number;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: ['update', 'insert'],
  })
  @JoinColumn()
  orderItems: OrderItem[];
}
