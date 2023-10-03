import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMobilePhone, IsDate, Length, MinLength, MaxLength, Matches, IsEmail, IsEnum, IsNumber, IsArray } from "class-validator";
import { Gender, Relationship } from "../../config/enum.constants";
import { StatDetailDto } from "./stat-detail.dto";

export class HealthStatDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'id' })
    medicalId: string

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ example: [{
        "type": "Height",
        "value": 170,
        "unit": "cm" 
    }, {
        "type": "Weight",
        "value": 60,
        "unit": "kg" 
    }] })
    stats: StatDetailDto[]
}