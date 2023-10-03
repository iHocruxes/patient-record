import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalRecord } from "./entities/medical-record.entity";
import { HealthStat } from "./entities/health-stat.entity";
import { PatientRecord } from "./entities/patient-record.entity";
import { HealthStatController } from "./controllers/health-stat.controller";
import { HealthStatService } from "./services/health-stat.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MedicalRecord, HealthStat, PatientRecord])
    ],
    controllers: [HealthStatController],
    providers: [HealthStatService],
})
export class RecordModule {

}