package com.ironsync.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DietMoodUpdateDTO {

    @NotNull(message = "记录 ID 不能为空")
    private Long id;

    @NotNull(message = "日期不能为空")
    @PastOrPresent(message = "记录日期不能是未来日期")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate recordDate;

    @NotNull(message = "碳水摄入量不能为空")
    @DecimalMin(value = "0", message = "碳水摄入量不能为负")
    private BigDecimal carbsG;

    @NotNull(message = "蛋白质摄入量不能为空")
    @DecimalMin(value = "0", message = "蛋白质摄入量不能为负")
    private BigDecimal proteinG;

    @NotNull(message = "脂肪摄入量不能为空")
    @DecimalMin(value = "0", message = "脂肪摄入量不能为负")
    private BigDecimal fatG;

    @NotNull(message = "情绪评分不能为空")
    @Min(value = 1, message = "情绪评分最低为 1")
    @Max(value = 10, message = "情绪评分最高为 10")
    private Integer moodScore;

    @Size(max = 500, message = "备注不能超过 500 字")
    private String note;
}
