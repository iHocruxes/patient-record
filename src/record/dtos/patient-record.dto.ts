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

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'folder' })
    folder: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'size' })
    size: string
}

export class CloudinaryConsumer {
    data: {
        asset_id: string,
        public_id: string,
        version: number,
        version_id: string,
        signature: string,
        resource_type: string,
        created_at: string,
        tag: any,
        bytes: number,
        type: string,
        etag: string,
        placeholder: boolean,
        url: string,
        secure_url: string,
        folder: string,
        access_mode: string,
        overwritten: boolean,
        original_filename: string,
        api_key: string
    }
    user: string
    folder: string
    medicalId: string
}

export class FolderDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'default' })
    folder: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'id' })
    medicalId: string
}