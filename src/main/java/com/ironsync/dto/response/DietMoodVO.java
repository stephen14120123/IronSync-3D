package com.ironsync.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "饮食情绪记录响应体")
public class DietMoodVO {
    @Schema(description = "记录 ID", example = "1")
    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    @Schema(description = "记录日期", example = "2025-06-01")
    private LocalDate recordDate;

    @Schema(description = "碳水化合物摄入量(g)", example = "250.0")
    private BigDecimal carbsG;

    @Schema(description = "蛋白质摄入量(g)", example = "150.0")
    private BigDecimal proteinG;

    @Schema(description = "脂肪摄入量(g)", example = "60.0")
    private BigDecimal fatG;

    @Schema(description = "情绪评分(1-10)", example = "8")
    private Integer moodScore;

    @Schema(description = "备注", example = "今天状态不错")
    private String note;
}
