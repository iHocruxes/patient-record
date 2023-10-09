import { Body, Controller, Get, Inject, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthStatService } from "../services/health-stat.service";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { HealthStatDto } from "../dtos/health-stat.dto";
import { HealthStats } from "../../config/enum.constants";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@ApiTags('Health Stats')
@Controller('health-stat')
export class HealthStatController {
    constructor(
        private readonly healthStatService: HealthStatService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật chỉ số sức khỏe của bệnh nhân', description: 'Thêm các chỉ số nếu chưa có hoặc cập nhật các chỉ số để bác sĩ có thể theo dõi' })
    @ApiParam({ name: 'type', enum: HealthStats, required: false })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Put()
    async updateHealthStatInformation(@Body() dto: HealthStatDto, @Req() req): Promise<any> {
        return await this.healthStatService.updateHealthStatInformation(dto, req.user.id)
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem các chỉ số sức khỏe bệnh nhân', description: 'Thông tin chỉ số sức khỏe bệnh nhân' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
    @Get(':medicalId')
    async getAllHealthStatOfMedicalRecord(@Param('medicalId') medicalId: string, @Req() req): Promise<any> {
        const cacheSchedules = await this.cacheManager.get('health-stat-' + req.user.id);
        if (cacheSchedules) return cacheSchedules

        const data = await this.healthStatService.getAllHealthStatOfMedicalRecord(medicalId, req.user.id)

        await this.cacheManager.set('health-stat-' + req.user.id, data)

        return data
    }
}