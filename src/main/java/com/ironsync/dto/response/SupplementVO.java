package com.ironsync.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Schema(description = "补剂信息响应体")
public class SupplementVO {
    @Schema(description = "补剂 ID", example = "1")
    private Long id;

    @Schema(description = "补剂名称", example = "酵母蛋白")
    private String name;

    @Schema(description = "当前库存(g)", example = "300.00")
    private BigDecimal currentStockG;

    @Schema(description = "每日消耗量(g)", example = "25.00")
    private BigDecimal dailyConsumptionG;

    @Schema(description = "补剂状态", example = "NORMAL")
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    @Schema(description = "创建时间", example = "2025-06-01 10:30:00")
    private LocalDateTime createdAt;
}
