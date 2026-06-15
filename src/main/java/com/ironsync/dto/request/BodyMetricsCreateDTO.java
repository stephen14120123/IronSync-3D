package com.ironsync.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "创建身体指标请求体")
public class BodyMetricsCreateDTO {

    @NotNull(message = "日期不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    @Schema(description = "记录日期", example = "2025-06-01")
    private LocalDate recordDate;

    @NotNull(message = "体重不能为空")
    @DecimalMin(value = "20.0", message = "体重不能低于 20kg")
    @DecimalMax(value = "300.0", message = "体重不能超过 300kg")
    @Schema(description = "体重(kg)", example = "75.5")
    private BigDecimal weightKg;

    @DecimalMin(value = "3.0", message = "体脂率不能低于 3%")
    @DecimalMax(value = "60.0", message = "体脂率不能超过 60%")
    @Schema(description = "体脂率(%)", example = "15.5")
    private BigDecimal bodyFatPercentage;

    @Size(max = 500, message = "备注不能超过 500 字")
    @Schema(description = "备注", example = "晨起空腹测量")
    private String note;
}
