package com.ironsync.entity;

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
public class BodyMetrics {
    private Long id;
    private Long userId;
    private LocalDate recordDate;
    private BigDecimal weightKg;
    private BigDecimal bodyFatPercentage;
    private String note;
}
