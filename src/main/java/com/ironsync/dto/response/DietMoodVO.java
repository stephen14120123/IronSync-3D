package com.ironsync.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DietMoodVO {
    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate recordDate;
    private BigDecimal carbsG;
    private BigDecimal proteinG;
    private BigDecimal fatG;
    private Integer moodScore;
    private String note;
}
