import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthJWTGuard } from '../auth/guards/jwt.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { RestaurantService } from './restaurant.service.js';
import { Roles } from '../auth/decorator/roles.decorator.js';
import { Role } from '../common/roles.enum.js';
import { CreateRestaurantDto } from './DTO/restaurant.dto.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('restaurant')
@UseGuards(AuthJWTGuard,RoleGuard)
export class RestaurantController {
    constructor(
        private readonly restaurantService:RestaurantService
    ){}

    @Post()
    @Roles(Role.Admin)
    create(
        @Body() dto:CreateRestaurantDto
    ){
        return this.restaurantService.createRestaurant(dto)
    }

    @Get()
    findAll(){
        return this.restaurantService.findAll()
    }

    @Get('accounts')
    @Roles(Role.Admin)
    findAccounts(){
        return this.restaurantService.findAllWithEmail()
    }

    @Get('me')
    @Roles(Role.restaurant)
    me(
        @Request() req: any
    ){
        return this.restaurantService.findMine(req.user.sub)
    }

     @Get(':id')
    findById(
        @Param('id', ParseObjectIdPipe) id:string
    ){
        return this.restaurantService.findById(id)
    }
}
