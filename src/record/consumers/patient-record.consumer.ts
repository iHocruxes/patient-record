import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { PatientRecordService } from "../services/patient-record.service"
import { CloudinaryConsumer, FolderDto, PatientRecordtDto } from "../dtos/patient-record.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager";
import { RabbitPayload, RabbitRPC } from "@golevelup/nestjs-rabbitmq"

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
        dto.medicalId = cloudinary.medicalId
        dto.record = cloudinary.data.public_id
        dto.folder = cloudinary.folder
        dto.size = await this.patientRecordService.convertByte(cloudinary.data.bytes)

        const data = await this.patientRecordService.createPatientRecord(dto, cloudinary.user)
        await this.cacheManager.del('patient-record-' + dto.medicalId)
        return data 
    }

    @RabbitRPC({
        exchange: 'healthline.upload.folder',
        routingKey: 'folder', 
        queue: 'folder',
    })
    async deleteFolder(dto: FolderDto): Promise<any> {
        const data = await this.patientRecordService.deleteFolder(dto)
        await this.cacheManager.del('patient-record-' + dto.medicalId)
        return data 
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'user',
        queue: 'user',
    })
    async findAllMainRecord(@RabbitPayload() uids: string[]): Promise<any> {
        return this.patientRecordService.findAllMainRecord(uids)
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'medical',
        queue: 'medical',
    })
    async findAllMedicalRecord(@RabbitPayload() ids: string[]): Promise<any> {
        return this.patientRecordService.findAllMedicalRecord(ids)
    }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'patient',
        queue: 'patient',
    })
    async findAllPatientRecord(@RabbitPayload() ids: string[]): Promise<any> {
        return this.patientRecordService.findAllPatientRecord(ids)
    }
}