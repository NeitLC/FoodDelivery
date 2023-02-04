import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { OrderItemService } from './order-item.service';
import { OrderItem } from './order-tem.entity';

@Crud({
  model: {
    type: OrderItem,
  },
})
@Controller('order-item')
export class OrderItemController implements CrudController<OrderItem> {
  constructor(public service: OrderItemService) {}
}
