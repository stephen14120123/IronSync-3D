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
@Schema(description = "每日热量消耗响应体")
public class DailyCaloriesVO {

    @Schema(description = "日期标签 (MM-DD)", example = "06-09")
    private String dateLabel;

    @Schema(description = "星期几", example = "一")
    private String dayLabel;

    @Schema(description = "当日消耗热量(kcal)", example = "320")
    private BigDecimal calories;
}
