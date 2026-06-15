package com.ironsync.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "更新训练记录请求体")
public class TrainingRecordUpdateDTO {

    @Schema(description = "记录 ID", example = "1")
    private Long id;

    @NotBlank(message = "动作名称不能为空")
    @Schema(description = "动作名称", example = "杠铃深蹲")
    private String actionName;

    @NotNull(message = "重量不能为空")
    @DecimalMin(value = "0.0", message = "重量不能为负数")
    @DecimalMax(value = "999.0", message = "重量不能超过 999kg")
    @Schema(description = "使用重量(kg)，自重动作可填 0", example = "80.0")
    private BigDecimal weightKg;

    @NotNull(message = "次数不能为空")
    @Min(value = 1, message = "次数不能小于 1")
    @Schema(description = "每组次数", example = "10")
    private Integer reps;

    @NotNull(message = "组数不能为空")
    @Min(value = 1, message = "组数不能小于 1")
    @Max(value = 50, message = "组数不能超过 50")
    @Schema(description = "组数", example = "5")
    private Integer sets;

    @NotNull(message = "RPE 不能为空")
    @DecimalMin(value = "1.0", message = "RPE 不能低于 1.0")
    @DecimalMax(value = "10.0", message = "RPE 不能超过 10.0")
    @Schema(description = "RPE 自感用力度(1.0-10.0)", example = "7.5")
    private BigDecimal rpe;

    @NotNull(message = "日期不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    @Schema(description = "训练日期", example = "2025-06-01")
    private LocalDate recordDate;
}
