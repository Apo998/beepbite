import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export const SUPPORT_TOPICS = ['account', 'orders', 'points', 'restaurants', 'other'] as const
export type SupportTopic = (typeof SUPPORT_TOPICS)[number]

export class SupportDTO{
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    name:string

    @IsEmail()
    @MaxLength(254)
    email:string

    @IsIn(SUPPORT_TOPICS)
    topic:SupportTopic

    @IsString()
    @MinLength(10)
    @MaxLength(2000)
    message:string
}
