package com.ironsync.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "数据大屏摘要响应体")
public class DashboardSummaryVO {

    @Schema(description = "今日已消耗热量(kcal)", example = "320")
    private BigDecimal totalCalories;

    @Schema(description = "目标热量(kcal)", example = "600")
    private BigDecimal targetCalories;

    @Schema(description = "今日动作数", example = "2")
    private Integer exerciseCount;

    @Schema(description = "今日总组数", example = "9")
    private Integer totalSets;

    @Schema(description = "今日平均 RPE", example = "7.5")
    private BigDecimal avgRpe;
}
