package com.ironsync.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SupplementUpdateDTO {

    private Long id;

    @NotBlank(message = "补剂名称不能为空")
    private String name;

    @NotNull(message = "当前库存不能为空")
    @DecimalMin(value = "0.01", message = "库存必须大于 0")
    private BigDecimal currentStockG;

    @NotNull(message = "每日消耗量不能为空")
    @DecimalMin(value = "0.01", message = "每日消耗量必须大于 0")
    private BigDecimal dailyConsumptionG;
}
