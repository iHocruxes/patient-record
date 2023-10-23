import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { PatientRecordService } from "../services/patient-record.service"
import { CloudinaryConsumer, PatientRecordtDto } from "../dtos/patient-record.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager";
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"

@Injectable()
export class PatientRecordConsumer {
    constructor(
        private readonly patientRecordService: PatientRecordService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    @RabbitRPC({
        exchange: 'healthline.upload.folder',
        routingKey: 'upload',
        queue: 'upload',
    })
    async createPatientRecord(cloudinary: CloudinaryConsumer): Promise<any> {

        const dto = new PatientRecordtDto
        dto.record = cloudinary.data.public_id
        dto.folder = cloudinary.folder
        dto.size = await this.patientRecordService.convertByte(cloudinary.data.bytes)

        const data = await this.patientRecordService.createPatientRecord(dto, cloudinary.user)
        await this.cacheManager.del('patientRecord-' + dto.medicalId)
        return data
    }
}