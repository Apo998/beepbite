import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthJWTGuard } from '../auth/guards/jwt.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { Roles } from '../auth/decorator/roles.decorator.js';
import { Role } from '../common/roles.enum.js';
import { CustomerService } from './customer.service.js';

@Controller('customer')
@UseGuards(AuthJWTGuard, RoleGuard)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get('me')
    @Roles(Role.Customer)
    me(@Request() req: any) {
        return this.customerService.getCode(req.user.sub)
    }
}
