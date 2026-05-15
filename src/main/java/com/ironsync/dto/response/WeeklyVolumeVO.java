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
@Schema(description = "周训练容量响应体")
public class WeeklyVolumeVO {

    @Schema(description = "周起始日期 (ISO)", example = "2026-05-11")
    private String weekStart;

    @Schema(description = "周训练总容量 (kg×组×次)", example = "12000")
    private BigDecimal volume;
}
