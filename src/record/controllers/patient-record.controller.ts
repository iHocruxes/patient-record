import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guards/jwt.guard"
import { PatientRecordService } from "../services/patient-record.service"
import { PatientRecordtDto } from "../dtos/patient-record.dto"

@ApiTags('Patient Record')

@Controller('record')
export class PatientRecordController {
    constructor(
        private readonly patientRecordService: PatientRecordService
    ) { }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Thêm hồ sơ bệnh án của bệnh nhân', description: 'Thêm các hồ sơ để bác sĩ có thể theo dõi' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh nhân' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Post()
    async createPatientRecord(@Body() dto: PatientRecordtDto, @Req() req): Promise<any> {
        return await this.patientRecordService.createPatientRecord(dto, req.user.id)
    }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Xem các hồ sơ bệnh án bệnh nhân', description: 'Xem các hồ sơ bệnh án bệnh nhân' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Get(':medicalId')
    async getAllPatientRecordOfMedicalRecord(@Param('medicalId') medicalId: string, @Req() req): Promise<any> {
        return await this.patientRecordService.getAllPatientRecordOfMedicalRecord(medicalId, req.user.id)
    }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Xóa hồ sơ bệnh án của bệnh nhân', description: 'Xóa hồ sơ bệnh án của bệnh nhận' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh án' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Delete(':recordId')
    async deletePatientRecord(@Param('recordId') recordId: string, @Req() req): Promise<any> {
        return await this.patientRecordService.deletePatientRecord(recordId, req.user.id)
    }
}