import { IsNumber, IsUUID, Min } from "class-validator";

export class CreateOrderDTO{

    @IsUUID()
    qrToken:string

    @IsNumber()
    @Min(1)
    amountPaid:number

}
