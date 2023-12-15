import { BaseService } from "../../config/base.service";
import { PatientRecord } from "../entities/patient-record.entity";
import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedicalRecord } from "../entities/medical-record.entity";
import { In, Repository } from "typeorm";
import { PatientRecordtDto } from "../dtos/patient-record.dto";
import { ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
@Injectable()
export class PatientRecordService extends BaseService<PatientRecord>{
    constructor(
        @InjectRepository(PatientRecord) private readonly patientRecordRepository: Repository<PatientRecord>,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>,
        private readonly amqpConnection: AmqpConnection,
    ) {
        super(patientRecordRepository)
    }

    async getMedicalRecord(medicalId: string, userId: string): Promise<MedicalRecord> {
        const medical = await this.medicalRecordRepository.findOne({ where: { 'id': medicalId, 'managerId': userId }, relations: ['patientRecords'] })

        return medical
    }

    async getAllPatientRecordOfMedicalRecord(medicalId: string, userId: string, isAdmin: boolean): Promise<any> {
        var medical
        if(isAdmin) medical = await this.medicalRecordRepository.findOne({ where: { 'id': medicalId }, relations: ['patientRecords'] })
        else medical = await this.getMedicalRecord(medicalId, userId)
        if (!medical)
            throw new NotFoundException('medical_record_not_found')
        
        const records = medical.patientRecords
        const data = []
        records.forEach(record => {
            data.push({
                id: record.id,
                record: record.record,
                folder: record.folder,
                size: record.size,
                update_at: record.updated_at,
            })
        })

        return {
            "code": 200,
            "message": "success",
            "data": data
        }
    }

    async createPatientRecord(dto: PatientRecordtDto, userId: string) {
        const medical = await this.getMedicalRecord(dto.medicalId, userId)
        if (!medical)
            return {
                "code": 404,
                "message": "medical_record_not_found",
            }
        const record = new PatientRecord()
        record.medical = medical
        record.record = dto.record
        record.folder = dto.folder
        record.size = dto.size
        record.updated_at = this.VNTime()

        try {
            await this.patientRecordRepository.save(record)
        } catch (error) {
            return {
                "code": 400,
                "message": "create_patient_record_failed",
            }
        }
        return {
            "code": 201,
            "message": "created"
        }
    }

    async getMedicalRecordInfomation(medicalId: string): Promise<any> {
        const medical = await this.medicalRecordRepository.findOne({ where: { 'id': medicalId }, relations: ['patientRecords'] })
        if (!medical)
            throw new NotFoundException('medical_record_not_found')
        const records = medical.patientRecords
        const data = []
        records.forEach(record => {
            data.push({
                id: record.id,
                record: record.record,
                folder: record.folder,
                size: record.size,
                update_at: record.updated_at,
            })
        })

        return {
            "code": 200,
            "message": "success",
            "data": data
        }
    }

    async deletePatientRecord(recordIds: string[], userId: string) {
        const record = await this.patientRecordRepository.find({ where: { id: In(recordIds) }, relations: ['medical'] })

        if(record.length === 0)
            throw new BadRequestException("not_found_patient-record")

        for(let i=0; i<record.length; i++)
            if (record[i].medical.managerId !== userId)
                throw new ForbiddenException('not_have_access')

        const data = record.map(r => r.record)

        const rabbit = await this.amqpConnection.request<any>({
            exchange: 'healthline.upload.folder',
            routingKey: 'delete_file',
            payload: data,
            timeout: 10000 * data.length + 10000,
        })

        if(rabbit.code !== 200)
            return rabbit

        try {
            await this.patientRecordRepository.remove(record)
        } catch (error) {
            throw new BadRequestException('remove_patient_record_failed')
        }

        return {
            medicalId: record[0].medical.id,
            data: rabbit
        }
    }

    async findAllMainRecord(uids: string[]) {
        const records = await this.medicalRecordRepository.find({ where: { isMainProfile: true, managerId: In(uids) } })

        if(records.length === 0)
            return {
                code: 404,
                message: "medical_record_not_found"
            }

        const data = []
        records.forEach(e => {
            data.push({
                uid: e.managerId,
                full_name: e.full_name,
                avatar: e.avatar
            })
        })
        return {
            "code": 200,
            "message": "success",
            "data": data
        }
    }

    async findAllMedicalRecord(ids: string[]) {
        const records = await this.medicalRecordRepository.find({ where: { id: In(ids) } })

        if(records.length === 0)
            return {
                code: 404,
                message: "medical_record_not_found"
            }

        const data = []
        records.forEach(e => {
            data.push({
                uid: e.managerId,
                full_name: e.full_name,
                avatar: e.avatar
            })
        })
        return {
            "code": 200,
            "message": "success",
            "data": data
        }
    }

    async convertByte(size: number) {
        if (size >= 1024 * 1024) { // Nếu kích thước lớn hơn hoặc bằng 1 MB
            const sizeInMB = (size / (1024 * 1024)).toFixed(2); // Chuyển đổi thành MB với 2 chữ số thập phân
            return sizeInMB + ' MB';
        } else if (size >= 1024) { // Nếu kích thước lớn hơn hoặc bằng 1 KB
            const sizeInKB = (size / 1024).toFixed(2); // Chuyển đổi thành KB với 2 chữ số thập phân
            return sizeInKB + ' KB';
        } else {
            return size + ' B';
        }
    }
}