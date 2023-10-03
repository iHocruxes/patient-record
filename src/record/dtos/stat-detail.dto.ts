import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsNumber, IsString, Length } from "class-validator"
import { HealthStats } from "../../config/enum.constants"

export class StatDetailDto {
    @IsNotEmpty()
    @IsEnum(HealthStats, { message: "Sai cú pháp" })
    @ApiProperty({ example: 'Height' })
    type: string

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: '170' })
    value: number

    @IsString()
    @IsNotEmpty()
    @Length(1, 10)
    @ApiProperty({ example: 'cm' })
    unit: string
}