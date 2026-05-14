package com.ironsync.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BodyMetricsCreateDTO {

    @NotNull(message = "日期不能为空")
    @PastOrPresent(message = "记录日期不能是未来日期")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate recordDate;

    @NotNull(message = "体重不能为空")
    @DecimalMin(value = "20.0", message = "体重不能低于 20kg")
    @DecimalMax(value = "300.0", message = "体重不能超过 300kg")
    private BigDecimal weightKg;

    @DecimalMin(value = "3.0", message = "体脂率不能低于 3%")
    @DecimalMax(value = "60.0", message = "体脂率不能超过 60%")
    private BigDecimal bodyFatPercentage;

    @Size(max = 500, message = "备注不能超过 500 字")
    private String note;
}
