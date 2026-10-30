import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Passport } from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategies extends PassportStrategy(Strategy){
    constructor(
        config:ConfigService
    ){

        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:config.getOrThrow<string>("JWT_SECRET")
        })
    }

    validate(payload:any) {
        return {
            sub:payload.sub,
            role:payload.role
        }

    }
}