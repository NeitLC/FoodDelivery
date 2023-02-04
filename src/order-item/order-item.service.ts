import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { OrderItem } from './order-tem.entity';

@Injectable()
export class OrderItemService extends TypeOrmCrudService<OrderItem> {
  constructor(@InjectRepository(OrderItem) repo) {
    super(repo);
  }
}
