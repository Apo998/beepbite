import { IsEnum } from "class-validator";
import { Status } from "../../common/status.enum.js";

export class UpdateStatusDto{
    @IsEnum(Status)
    status: Status
}