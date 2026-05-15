package com.ironsync.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SupplementStatusVO {
    private Long id;
    private String name;
    private String status;
    private BigDecimal remainingDays;
    private BigDecimal currentStockG;
    private BigDecimal dailyConsumptionG;
}
