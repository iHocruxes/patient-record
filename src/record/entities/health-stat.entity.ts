import { nanoid } from "nanoid"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { MedicalRecord } from "./medical-record.entity"
import { HealthStats } from "../../config/enum.constants"

@Entity({ name: 'HealthStats' })
export class HealthStat {
    constructor() {
        this.id = nanoid()
    }

    @PrimaryColumn()
    id: string

    @ManyToOne(() => MedicalRecord, medicalRecord => medicalRecord.healthStats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medical_id' })
    medical: MedicalRecord

    @Column({ name: 'health_stat_type', type: 'enum', enum: HealthStats })
    health_stat_type: string

    @Column({ nullable: true, type: 'float' })
    value: number

    @Column({ nullable: true })
    unit: string

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}