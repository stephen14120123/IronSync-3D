package com.ironsync.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "补剂状态响应体")
public class SupplementStatusVO {
    @Schema(description = "补剂 ID", example = "1")
    private Long id;

    @Schema(description = "补剂名称", example = "酵母蛋白")
    private String name;

    @Schema(description = "补剂状态", example = "NORMAL")
    private String status;

    @Schema(description = "剩余天数", example = "12.0")
    private BigDecimal remainingDays;

    @Schema(description = "当前库存(g)", example = "300.00")
    private BigDecimal currentStockG;

    @Schema(description = "每日消耗量(g)", example = "25.00")
    private BigDecimal dailyConsumptionG;
}
