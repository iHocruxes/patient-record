import { nanoid } from "nanoid"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { MedicalRecord } from "./medical-record.entity"

@Entity({ name: 'PatientRecords' })
export class PatientRecord {
    constructor() {
        this.id = nanoid()
    }

    @PrimaryColumn()
    id: string

    @ManyToOne(() => MedicalRecord, medicalRecord => medicalRecord.healthStats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medical_id' })
    medical: MedicalRecord

    @Column()
    record: string

    @Column({ nullable: true })
    format: string

    @Column({ nullable: true, name: 'resource_type' })
    resource_type: string

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}