import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guards/jwt.guard"
import { PatientRecordService } from "../services/patient-record.service"
import { CloudinaryConsumer, PatientRecordtDto } from "../dtos/patient-record.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq"
// import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"

@ApiTags('Patient Record')

@Controller('record')
export class PatientRecordController {
    constructor(
        private readonly patientRecordService: PatientRecordService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    @Get("wait")
    waiting() {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < 5000);
        return
    }

    // @UseGuards(JwtGuard)
    // @ApiBearerAuth()
    // @ApiOperation({ summary: 'Thêm hồ sơ bệnh án của bệnh nhân', description: 'Thêm các hồ sơ để bác sĩ có thể theo dõi' })
    // @ApiResponse({ status: 201, description: 'Thành công' })
    // @ApiResponse({ status: 400, description: 'Tạo hồ sơ bệnh nhân thất bại' })
    // @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    // @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh án' })
    // @Post()
    // async createPatientRecord(@Body() dto: PatientRecordtDto, @Req() req): Promise<any> {
    //     const data = await this.patientRecordService.createPatientRecord(dto, req.user.id)
    //     await this.cacheManager.del('patientRecord-' + dto.medicalId)
    //     return data
    // }

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

        const data = await this.patientRecordService.getAllPatientRecordOfMedicalRecord(medicalId, req.user.id)

        await this.cacheManager.set('patientRecord-' + medicalId, data)

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
    @Delete(':recordId')
    async deletePatientRecord(@Param('recordId') recordId: string, @Req() req): Promise<any> {
        const result = await this.patientRecordService.deletePatientRecord(recordId, req.user.id)
        await this.cacheManager.del('patientRecord-' + result.medicalId)
        return result.data
    }
}