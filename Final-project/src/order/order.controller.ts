import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthJWTGuard } from '../auth/guards/jwt.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { OrderService } from './order.service.js';
import { Roles } from '../auth/decorator/roles.decorator.js';
import { Role } from '../common/roles.enum.js';
import { CreateOrderDTO } from './DTO/order.dto.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { UpdateStatusDto } from './DTO/update.status.dto.js';

@Controller('order')
@UseGuards(AuthJWTGuard, RoleGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post("new")
    @Roles(Role.restaurant)
    create(
        @Body() dto: CreateOrderDTO,
        @Request() req: any
    ) {
        return this.orderService.createOrder(dto, req.user.sub)
    }

   @Get('all')
@Roles(Role.Customer)
findAll(@Request() req: any) {
  console.log('req.user:', req.user);
  return this.orderService.findOrders(req.user.sub);
}

    @Get("restaurant")
    @Roles(Role.restaurant)
    findForRestaurant(@Request() req: any) {
        return this.orderService.findRestaurantOrders(req.user.sub)
    }

    @Get("ready")
    @Roles(Role.Customer)
    findReady(@Request() req: any) {
        return this.orderService.findReadyOrders(req.user.sub)
    }

    @Patch(':id/status')
    @Roles(Role.restaurant)
    updateStatus(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() dto: UpdateStatusDto,
        @Request() req: any
    ) {
        return this.orderService.updateStatus(id, dto, req.user.sub)
    }



}
