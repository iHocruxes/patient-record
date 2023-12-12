import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalRecord } from "./entities/medical-record.entity";
import { HealthStat } from "./entities/health-stat.entity";
import { PatientRecord } from "./entities/patient-record.entity";
import { HealthStatController } from "./controllers/health-stat.controller";
import { HealthStatService } from "./services/health-stat.service";
import { PatientRecordController } from "./controllers/patient-record.controller";
import { PatientRecordService } from "./services/patient-record.service";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { PatientRecordConsumer } from "./consumers/patient-record.consumer";

@Module({
    imports: [
        TypeOrmModule.forFeature([MedicalRecord, HealthStat, PatientRecord]),
        RabbitMQModule.forRoot(RabbitMQModule, {
            exchanges: [
                {
                    name: 'healthline.upload.folder',
                    type: 'direct'
                },
                {
                    name: 'healthline.user.information',
                    type: 'direct'
                }
            ],
            uri: process.env.RABBITMQ_URL,
            connectionInitOptions: { wait: false, reject: true, timeout: 10000 },
        }),
    ],
    controllers: [
        HealthStatController,
        PatientRecordController
    ],
    providers: [
        HealthStatService,
        PatientRecordService,
        PatientRecordConsumer
    ],
})
export class RecordModule {

}