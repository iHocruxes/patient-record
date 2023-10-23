import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { PatientRecordService } from "../services/patient-record.service"
import { CloudinaryConsumer, PatientRecordtDto } from "../dtos/patient-record.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager";
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"

@Injectable()
export class PatientRecordConsumer {
    constructor(
        private readonly patientRecordService: PatientRecordService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }



    // @UseGuards(JwtGuard)
    // @ApiBearerAuth()
    // @ApiOperation({ summary: 'Xóa hồ sơ bệnh án của bệnh nhân', description: 'Xóa hồ sơ bệnh án của bệnh nhận' })
    // @ApiResponse({ status: 200, description: 'Thành công' })
    // @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    // @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
    // @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ bệnh án' })
    // @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    // @Delete(':recordId')
    // async deletePatientRecord(@Param('recordId') recordId: string, @Req() req): Promise<any> {
    //     const result = await this.patientRecordService.deletePatientRecord(recordId, req.user.id)
    //     await this.cacheManager.del('patientRecord-' + result.medicalId)
    //     return result.data
    // }
}