import { IsEmail, IsEnum, IsString } from "class-validator";
import { Role } from "../../common/roles.enum.js";

export class CreateUserDTO{

    @IsString()
    name:string

    @IsEmail()
    email:string

    @IsString()
    password:string

    @IsEnum(Role)
    role:Role
}