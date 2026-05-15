package com.ironsync.entity;

import com.ironsync.common.constant.ActionEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingRecord {
    private Long id;
    private Long userId;
    private ActionEnum actionName;
    private BigDecimal weightKg;
    private Integer reps;
    private Integer sets;
    private BigDecimal rpe;
    private LocalDate recordDate;
    private Integer deleted;
}
