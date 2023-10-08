import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../config/base.service";
import { HealthStat } from "../entities/health-stat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MedicalRecord } from "../entities/medical-record.entity";
import { Repository } from "typeorm";
import { HealthStatDto } from "../dtos/health-stat.dto";
import { HealthStats } from "../../config/enum.constants";

@Injectable()
export class HealthStatService extends BaseService<HealthStat>{
    constructor(
        @InjectRepository(HealthStat) private readonly healthStatRepository: Repository<HealthStat>,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>
    ) {
        super(healthStatRepository)
    }

    async getMedicalRecord(medicalId: string, userId: string): Promise<MedicalRecord> {
        const medical = await this.medicalRecordRepository.findOne( { where: { 'id': medicalId, 'managerId': userId }, relations: ['healthStats'] })

        if(!medical)
            throw new NotFoundException('Hồ sơ không tồn tại')

        return medical
    }

    async getAllHealthStatOfMedicalRecord(medicalId: string, userId: string): Promise<any> {
        const stats = (await this.getMedicalRecord(medicalId, userId)).healthStats
        const data = []
        stats.forEach(stat => {
            data.push({
                id: stat.id,
                type: stat.health_stat_type,
                value: stat.value,
                unit: stat.unit
            })
        })

        return {
            "code": 200,
            "message": "Success",
            "data": data
        }
    }

    async updateHealthStatInformation(dto: HealthStatDto, userId: string): Promise<any> {
        const medical = await this.getMedicalRecord(dto.medicalId, userId)
        const stats = medical.healthStats

        for(let i = 0; i < dto.stats.length; i++) {
            if(!(dto.stats[i].type in HealthStats))
                throw new BadRequestException('Sai cú pháp')

            var flag = false
            for(let j = 0; j < stats.length; j++) {
                if(dto.stats[i].type === stats[j].health_stat_type ) {
                    stats[j].value = dto.stats[i].value
                    stats[j].unit = dto.stats[i].unit
                    
                    try {
                        await this.healthStatRepository.save(stats[j])
                    } catch (error) {
                        throw new BadRequestException('Chỉnh sửa thất bại')
                    }

                    flag = true
                    break
                }
            }

            if(flag === false) {
                const stat = new HealthStat()
                stat.health_stat_type = dto.stats[i].type
                stat.medical = medical
                stat.unit = dto.stats[i].unit
                stat.value = dto.stats[i].value
                stat.updated_at = this.VNTime()

                try {
                    await this.healthStatRepository.save(stat)
                } catch (error) {
                    throw new BadRequestException('Chỉnh sửa thất bại')
                }
            }
        }

        return {
            "code": 200,
            "message": "Success"
        }
    }

    
}