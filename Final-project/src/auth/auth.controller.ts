import { Controller, Post,Body, HttpCode, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDTO } from './DTO/register.auth.dto.js';
import { LoginDTO } from './DTO/login.auth.dto.js';
import { AuthJWTGuard } from './guards/jwt.guard.js';
import { ForgotPasswordDTO } from './DTO/forgot.password.dto.js';
import { ResetPasswordDTO } from './DTO/reset.password.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post("register")
    register(
        @Body() dto:RegisterDTO
    )
    {
        return this.authService.register(dto)
    }

    @Post("login")
    @HttpCode(200)
    login(
        @Body() dto:LoginDTO
    )
    {
        return this.authService.login(dto)
    }

    @Post("forgot-password")
    @HttpCode(200)
    forgotPassword(
        @Body() dto:ForgotPasswordDTO
    )
    {
        return this.authService.forgotPassword(dto)
    }

    @Post("reset-password")
    @HttpCode(200)
    resetPassword(
        @Body() dto:ResetPasswordDTO
    )
    {
        return this.authService.resetPassword(dto)
    }

    @UseGuards(AuthJWTGuard)
@Get('me')
me(@Request() req: any) {
  return this.authService.me(req.user.sub);
}
}
