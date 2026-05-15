package com.ironsync.service.supplement;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class StatusMachine {

    public String calculate(BigDecimal stockG, BigDecimal dailyConsumptionG) {
        if (stockG == null || dailyConsumptionG == null
                || dailyConsumptionG.compareTo(BigDecimal.ZERO) == 0) {
            return StatusLevel.CRITICAL.getDisplayName();
        }
        BigDecimal days = stockG.divide(dailyConsumptionG, 2, RoundingMode.HALF_UP);
        return StatusLevel.fromDays(days).getDisplayName();
    }

    public BigDecimal calcRemainingDays(BigDecimal stockG, BigDecimal dailyConsumptionG) {
        if (stockG == null || dailyConsumptionG == null
                || dailyConsumptionG.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return stockG.divide(dailyConsumptionG, 1, RoundingMode.HALF_UP);
    }
}
