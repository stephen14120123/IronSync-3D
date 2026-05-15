package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.response.DashboardSummaryVO;
import com.ironsync.dto.response.TrainingRecordVO;
import com.ironsync.service.TrainingRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "数据大屏", description = "3D 数据大屏的摘要信息和热量统计接口")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TrainingRecordService trainingRecordService;

    public DashboardController(TrainingRecordService trainingRecordService) {
        this.trainingRecordService = trainingRecordService;
    }

    @Operation(summary = "获取大屏摘要", description = "返回今日训练统计和热量消耗汇总")
    @ApiResponse(responseCode = "200", description = "成功返回摘要数据")
    @GetMapping("/summary")
    public Result<DashboardSummaryVO> summary() {
        List<TrainingRecordVO> todayRecords = trainingRecordService.findByDate(LocalDate.now());
        BigDecimal totalCalories = trainingRecordService.calculateTodayCalories();

        int exerciseCount = todayRecords.size();
        int totalSets = todayRecords.stream().mapToInt(r -> r.getSets() != null ? r.getSets() : 0).sum();
        BigDecimal avgRpe = todayRecords.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf(todayRecords.stream()
                        .mapToDouble(r -> r.getRpe() != null ? r.getRpe().doubleValue() : 0)
                        .average().orElse(0))
                .setScale(1, RoundingMode.HALF_UP);

        DashboardSummaryVO vo = DashboardSummaryVO.builder()
                .totalCalories(totalCalories)
                .targetCalories(BigDecimal.valueOf(600))
                .exerciseCount(exerciseCount)
                .totalSets(totalSets)
                .avgRpe(avgRpe)
                .build();

        return Result.success(vo);
    }
}
