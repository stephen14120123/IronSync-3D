package com.ironsync.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TrainingRecordVO {
    private Long id;
    private String actionName;
    private BigDecimal weightKg;
    private Integer reps;
    private Integer sets;
    private BigDecimal rpe;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate recordDate;
}
