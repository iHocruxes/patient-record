import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthStatService } from "../services/health-stat.service";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { HealthStatDto } from "../dtos/health-stat.dto";
import { HealthStats } from "../../config/enum.constants";

@ApiTags('Health Stats')

@Controller('health-stat')
export class HealthStatController {
    constructor(
        private readonly healthStatService: HealthStatService
    ) { }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Cập nhật chỉ số sức khỏe của bệnh nhân', description: 'Cập nhật các chỉ số để bác sĩ có thể theo dõi' })
    @ApiParam({ name: 'type', enum: HealthStats, required: false })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Post()
    async updateHealthStatInformation(@Body() dto: HealthStatDto, @Req() req): Promise<any> {
        return await this.healthStatService.updateHealthStatInformation(dto, req.user.id)
    }

    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Xem các chỉ số sức khỏe bệnh nhân', description: 'Thông tin chỉ số sức khỏe bệnh nhân' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Get(':medicalId')
    async getAllHealthStatOfMedicalRecord(@Param('medicalId') medicalId: string, @Req() req): Promise<any> {
        return await this.healthStatService.getAllHealthStatOfMedicalRecord(medicalId, req.user.id)
    }
}