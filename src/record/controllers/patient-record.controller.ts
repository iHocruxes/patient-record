import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guards/jwt.guard"
import { PatientRecordService } from "../services/patient-record.service"
import { CloudinaryConsumer, PatientRecordtDto } from "../dtos/patient-record.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq"
import { AdminGuard } from "../../auth/guards/admin.guard"

@ApiTags('Patient Record')

@Controller('record')
export class PatientRecordController {
    constructor(
        private readonly patientRecordService: PatientRecordService,
        private readonly amqpConnection: AmqpConnection,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem các hồ sơ bệnh án bệnh nhân', description: 'Xem các hồ sơ bệnh án bệnh nhân' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh án' })
    @Get(':medicalId')
    async getAllPatientRecordOfMedicalRecord(@Param('medicalId') medicalId: string, @Req() req): Promise<any> {
        const cacheSchedules = await this.cacheManager.get('patient-record-' + medicalId);
        if (cacheSchedules) return cacheSchedules

        const data = await this.patientRecordService.getAllPatientRecordOfMedicalRecord(medicalId, req.user.id, false)

        await this.cacheManager.set('patient-record-' + medicalId, data)

        return data
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa hồ sơ bệnh án của bệnh nhân', description: 'Xóa hồ sơ bệnh án của bệnh nhận' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh án' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Delete()
    async deletePatientRecord(@Body() dto: {recordIds: string[]}, @Req() req): Promise<any> {
        const result = await this.patientRecordService.deletePatientRecord(dto.recordIds, req.user.id)
        await this.cacheManager.del('patient-record-' + result.medicalId)
        return result.data
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem các hồ sơ bệnh án bệnh nhân', description: 'Xem các hồ sơ bệnh án bệnh nhân' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh án' })
    @Get('/admin/:medicalId')
    async getMedicalRecordInfomation(@Param('medicalId') medicalId: string): Promise<any> {
        const cacheSchedules = await this.cacheManager.get('patient-record-' + medicalId);
        if (cacheSchedules) return cacheSchedules

        const data = await this.patientRecordService.getAllPatientRecordOfMedicalRecord(medicalId, "", true)

        await this.cacheManager.set('patient-record-' + medicalId, data)

        return data
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa hồ sơ bệnh án của bệnh nhân', description: 'Xóa hồ sơ bệnh án của bệnh nhận' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh án' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Delete(':userId')
    async deletePatientRecordAdmin(@Body() dto: {recordIds: string[]}, @Param('userId') userId: string): Promise<any> {
        const result = await this.patientRecordService.deletePatientRecord(dto.recordIds, userId)
        await this.cacheManager.del('patient-record-' + result.medicalId)
        return result.data
    }
}