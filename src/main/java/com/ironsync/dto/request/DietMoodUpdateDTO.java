package com.ironsync.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "更新饮食情绪记录请求体")
public class DietMoodUpdateDTO {

    @NotNull(message = "记录 ID 不能为空")
    @Schema(description = "记录 ID", example = "1")
    private Long id;

    @NotNull(message = "日期不能为空")
    @PastOrPresent(message = "记录日期不能是未来日期")
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

    @NotNull(message = "情绪评分不能为空")
    @Min(value = 1, message = "情绪评分最低为 1")
    @Max(value = 10, message = "情绪评分最高为 10")
    @Schema(description = "情绪评分(1-10)", example = "8")
    private Integer moodScore;

    @Size(max = 500, message = "备注不能超过 500 字")
    @Schema(description = "备注", example = "今天状态不错")
    private String note;
}
