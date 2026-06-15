package com.ironsync.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "更新饮食记录请求体")
public class DietMoodUpdateDTO {

    @Schema(description = "记录 ID", example = "1")
    private Long id;

    @NotNull(message = "日期不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    @Schema(description = "记录日期", example = "2025-06-01")
    private LocalDate recordDate;

    @NotNull(message = "碳水摄入量不能为空")
    @DecimalMin(value = "0", message = "碳水摄入量不能为负")
    @Schema(description = "碳水化合物摄入量(g)", example = "250.0")
    private BigDecimal carbsG;

    @NotNull(message = "蛋白质摄入量不能为空")
    @DecimalMin(value = "0", message = "蛋白质摄入量不能为负")
    @Schema(description = "蛋白质摄入量(g)", example = "150.0")
    private BigDecimal proteinG;

    @NotNull(message = "脂肪摄入量不能为空")
    @DecimalMin(value = "0", message = "脂肪摄入量不能为负")
    @Schema(description = "脂肪摄入量(g)", example = "60.0")
    private BigDecimal fatG;

    @Size(max = 500, message = "备注不能超过 500 字")
    @Schema(description = "备注", example = "今天状态不错")
    private String note;
}
