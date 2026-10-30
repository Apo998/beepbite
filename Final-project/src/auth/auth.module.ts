import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CustomerModule } from '../customer/customer.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategies } from './strategies/jwt.strategies.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
    imports:[
        UserModule,
        CustomerModule,
        PassportModule,
        MailModule,

        JwtModule.registerAsync({
            global:true,
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory:(config:ConfigService)=>
            ({
                secret:config.getOrThrow<string>("JWT_SECRET"),
                signOptions:{
                    expiresIn:config.get<string>("JWT_EXPIRES_IN","1h") as JwtSignOptions['expiresIn']
                }
            })
        })

    ],

    controllers:[AuthController],
    providers:[AuthService,JwtStrategies]
})
export class AuthModule {}
