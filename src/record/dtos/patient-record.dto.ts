import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class PatientRecordtDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'id' })
    medicalId: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'document' })
    record: string
}