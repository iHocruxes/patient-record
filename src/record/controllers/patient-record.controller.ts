import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guards/jwt.guard"
import { PatientRecordService } from "../services/patient-record.service"

@ApiTags('Patient Record')

@Controller('patient-record')
export class PatientRecordController {
    constructor(
        private readonly patientRecordService: PatientRecordService
    ) { }
    // @UseGuards(JwtGuard)
    // @ApiOperation({ summary: 'Cập nhật chỉ số sức khỏe của bệnh nhân', description: 'Cập nhật các chỉ số để bác sĩ có thể theo dõi' })
    // @ApiResponse({ status: 200, description: 'Thành công' })
    // @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    // @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    // @Post()
    // async updateHealthStatInformation(@Body() dto: HealthStatDto, @Req() req): Promise<any> {
    //     return await this.patientRecordService.updateHealthStatInformation(dto, req.user.id)
    // }

    // @UseGuards(JwtGuard)
    // @ApiOperation({ summary: 'Xem các chỉ số sức khỏe bệnh nhân', description: 'Thông tin chỉ số sức khỏe bệnh nhân' })
    // @ApiResponse({ status: 200, description: 'Thành công' })
    // @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    // @Get(':medicalId')
    // async getAllHealthStatOfMedicalRecord(@Param('medicalId') medicalId: string, @Req() req): Promise<any> {
    //     return await this.healthStatService.getAllHealthStatOfMedicalRecord(medicalId, req.user.id)
    // }
}