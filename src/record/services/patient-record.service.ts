import { BaseService } from "../../config/base.service";
import { PatientRecord } from "../entities/patient-record.entity";
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MedicalRecord } from "../entities/medical-record.entity";
import { Repository } from "typeorm";
import { PatientRecordtDto } from "../dtos/patient-record.dto";
import { ApiUnauthorizedResponse } from "@nestjs/swagger";

@Injectable()
export class PatientRecordService extends BaseService<PatientRecord>{
    constructor(
        @InjectRepository(PatientRecord) private readonly patientRecordRepository: Repository<PatientRecord>,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>
    ) {
        super(patientRecordRepository)
    }

    async getMedicalRecord(medicalId: string, userId: string): Promise<MedicalRecord> {
        const medical = await this.medicalRecordRepository.findOne({ where: { 'id': medicalId, 'managerId': userId }, relations: ['patientRecords'] })

        if(!medical)
            throw new NotFoundException('medical_record_not_found')

        return medical
    }

    async getAllPatientRecordOfMedicalRecord(medicalId: string, userId: string): Promise<any> {
        const records = (await this.getMedicalRecord(medicalId, userId)).patientRecords
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

        const record = new PatientRecord()
        record.medical = medical
        record.record = dto.record
        record.folder = dto.folder
        record.size = dto.size
        record.updated_at = this.VNTime()

        try {
            await this.patientRecordRepository.save(record)
        } catch (error) {
            throw new BadRequestException('create_patient_record_failed')
        }

        return {
            "code": 201,
            "message": "created"
        }
    }

    async deletePatientRecord(recordId: string, userId: string) {
        const record = await this.patientRecordRepository.findOne({ where: { id: recordId }, relations: ['medical'] })
        
        if(record.medical.managerId !== userId)
            throw new ForbiddenException('not_have_access')

        try {
            await this.patientRecordRepository.remove(record)
        } catch (error) {
            throw new BadRequestException('remove_patient_record_failed')
        }

        return {
            medicalId: record.medical.id,
            data: {
                "code": 200,
                "message": "success"
            }
        }
    }
}