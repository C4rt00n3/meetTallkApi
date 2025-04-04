import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateBlockDto {
    @IsUUID()
    @IsNotEmpty()
    blockedUserId: string;
}
