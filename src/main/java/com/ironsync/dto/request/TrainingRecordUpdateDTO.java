package com.ironsync.dto.request;

import com.ironsync.common.constant.ActionEnum;
import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TrainingRecordUpdateDTO {

    @NotNull(message = "记录 ID 不能为空")
    private Long id;

    @NotNull(message = "动作名称不能为空")
    private ActionEnum actionName;

    @NotNull(message = "重量不能为空")
    @DecimalMin(value = "1.0", message = "重量不能小于 1kg")
    @DecimalMax(value = "999.0", message = "重量不能超过 999kg")
    private BigDecimal weightKg;

    @NotNull(message = "次数不能为空")
    @Min(value = 1, message = "次数不能小于 1")
    private Integer reps;

    @NotNull(message = "组数不能为空")
    @Min(value = 1, message = "组数不能小于 1")
    @Max(value = 50, message = "组数不能超过 50")
    private Integer sets;

    @NotNull(message = "RPE 不能为空")
    @DecimalMin(value = "1.0", message = "RPE 不能低于 1.0")
    @DecimalMax(value = "10.0", message = "RPE 不能超过 10.0")
    private BigDecimal rpe;

    @NotNull(message = "日期不能为空")
    @PastOrPresent(message = "训练日期不能是未来日期")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate recordDate;
}
