import { BaseService } from "../../config/base.service";
import { PatientRecord } from "../entities/patient-record.entity";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
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
        const medical = await this.medicalRecordRepository.findOneBy({ 'id': medicalId, 'managerId': userId })

        if(!medical)
            throw new NotFoundException('Hồ sơ không tồn tại')

        return medical
    }

    async getAllPatientRecordOfMedicalRecord(medicalId: string, userId: string): Promise<PatientRecord[]> {
        try {
            return await this.patientRecordRepository.findBy({'medical': { 'id': medicalId, 'managerId': userId }})
        } catch (error) {
            throw new InternalServerErrorException('Lỗi máy chủ')
        }
    }

    async createPatientRecord(dto: PatientRecordtDto, userId: string) {
        const medical = await this.getMedicalRecord(dto.medicalId, userId)

        const record = new PatientRecord()
        record.medical = medical
        record.record = dto.record
        record.updated_at = this.VNTime()

        try {
            await this.patientRecordRepository.save(record)
        } catch (error) {
            throw new BadRequestException('Tạo tài liệu thất bại')
        }

        return {
            "code": 201,
            "message": "Created"
        }
    }

    async deletePatientRecord(recordId: string, userId: string) {
        const record = await this.patientRecordRepository.findOne({ where: { id: recordId }, relations: ['medical'] })
        
        if(record.medical.managerId !== userId)
            throw new UnauthorizedException('Không có quyền truy cập')

        try {
            await this.patientRecordRepository.remove(record)
        } catch (error) {
            throw new BadRequestException('Xóa tài liệu thất bại')
        }

        return {
            "code": 200,
            "message": "Success"
        }
    }
}