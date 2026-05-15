package com.ironsync.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "训练记录响应体")
public class TrainingRecordVO {
    @Schema(description = "记录 ID", example = "1")
    private Long id;

    @Schema(description = "动作名称", example = "深蹲")
    private String actionName;

    @Schema(description = "重量(kg)", example = "100.0")
    private BigDecimal weightKg;

    @Schema(description = "次数", example = "10")
    private Integer reps;

    @Schema(description = "组数", example = "4")
    private Integer sets;

    @Schema(description = "RPE 值", example = "8.0")
    private BigDecimal rpe;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    @Schema(description = "记录日期", example = "2025-06-01")
    private LocalDate recordDate;
}
