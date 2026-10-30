import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SupportService } from './support.service.js';
import { SupportDTO } from './DTO/support.dto.js';

@Controller('support')
export class SupportController {
    constructor(private readonly supportService:SupportService){}

    @Post()
    @HttpCode(200)
    contact(
        @Body() dto:SupportDTO
    )
    {
        return this.supportService.contact(dto)
    }
}
