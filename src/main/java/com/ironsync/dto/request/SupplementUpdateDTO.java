package com.ironsync.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "更新补剂请求体")
public class SupplementUpdateDTO {

    @Schema(description = "补剂 ID", example = "1")
    private Long id;

    @NotBlank(message = "补剂名称不能为空")
    @Schema(description = "补剂名称", example = "酵母蛋白")
    private String name;

    @NotNull(message = "当前库存不能为空")
    @DecimalMin(value = "0.01", message = "库存必须大于 0")
    @Schema(description = "当前库存总量(g)", example = "300.00")
    private BigDecimal currentStockG;

    @NotNull(message = "每日消耗量不能为空")
    @DecimalMin(value = "0.01", message = "每日消耗量必须大于 0")
    @Schema(description = "每日消耗量(g)", example = "25.00")
    private BigDecimal dailyConsumptionG;
}
