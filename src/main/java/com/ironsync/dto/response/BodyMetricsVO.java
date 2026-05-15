package com.ironsync.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "身体指标响应体")
public class BodyMetricsVO {
    @Schema(description = "记录 ID", example = "1")
    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    @Schema(description = "记录日期", example = "2025-06-01")
    private LocalDate recordDate;

    @Schema(description = "体重(kg)", example = "75.5")
    private BigDecimal weightKg;

    @Schema(description = "体脂率(%)", example = "15.5")
    private BigDecimal bodyFatPercentage;

    @Schema(description = "备注", example = "晨起空腹测量")
    private String note;
}
