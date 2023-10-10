import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../config/base.service";
import { HealthStat } from "../entities/health-stat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MedicalRecord } from "../entities/medical-record.entity";
import { Repository } from "typeorm";
import { HealthStatDto } from "../dtos/health-stat.dto";
import { HealthStats } from "../../config/enum.constants";
import { StatDetailDto } from "../dtos/stat-detail.dto";

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
            throw new NotFoundException('medical_record_not_found')

        return medical
    }

    async getAllHealthStatOfMedicalRecord(medicalId: string, userId: string): Promise<any> {
        const stats = (await this.getMedicalRecord(medicalId, userId)).healthStats
        const data = []
        const data_head_cricumference = []
        stats.forEach(stat => {
            if(stat.health_stat_type === HealthStats.Head_cricumference){
                data_head_cricumference.push({
                    id: stat.id,
                    value: stat.value,
                    unit: stat.unit,
                    updated_at: stat.updated_at
                })
            } else {
                data.push({
                    id: stat.id,
                    type: stat.health_stat_type,
                    value: stat.value,
                    unit: stat.unit,
                    updated_at: stat.updated_at
                })
            }
        })

        if(data_head_cricumference.length !== 0) {
            data.push({
                type:  HealthStats.Head_cricumference,
                history: data_head_cricumference
            })
        }

        return {
            "code": 200,
            "message": "success",
            "data": data
        }
    }

    async addStat(dto: StatDetailDto, medical: MedicalRecord) {
        const stat = new HealthStat()
        stat.health_stat_type = dto.type
        stat.medical = medical
        stat.unit = dto.unit
        stat.value = dto.value
        stat.updated_at = this.VNTime()

        try {
            await this.healthStatRepository.save(stat)
        } catch (error) {
            throw new BadRequestException('create_health_stat_failed')
        }
    }

    async updateHealthStatInformation(dto: HealthStatDto, userId: string): Promise<any> {
        const medical = await this.getMedicalRecord(dto.medicalId, userId)
        const stats = medical.healthStats

        for(let i = 0; i < dto.stats.length; i++) {
            if(!(dto.stats[i].type in HealthStats))
                throw new BadRequestException('wrong_syntax')

            if(dto.stats[i].type === HealthStats.Head_cricumference) {
                this.addStat(dto.stats[i], medical)
                continue
            }

            var flag = false
            for(let j = 0; j < stats.length; j++) {
                if(dto.stats[i].type === stats[j].health_stat_type ) {
                    stats[j].value = dto.stats[i].value
                    stats[j].unit = dto.stats[i].unit
                    
                    try {
                        await this.healthStatRepository.save(stats[j])
                    } catch (error) {
                        throw new BadRequestException('update_health_stat_failed')
                    }

                    flag = true
                    break
                }
            }

            if(flag === false) {
                this.addStat(dto.stats[i], medical)
            }
        }

        return {
            "code": 200,
            "message": "success"
        }
    }

    
}