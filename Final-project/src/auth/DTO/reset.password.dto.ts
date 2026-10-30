import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDTO{
    @IsString()
    @IsNotEmpty()
    token:string

    @IsString()
    @MinLength(8)
    password:string
}
