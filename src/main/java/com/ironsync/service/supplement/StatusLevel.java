package com.ironsync.service.supplement;

import java.math.BigDecimal;
import java.util.function.Predicate;

public enum StatusLevel {
    SUFFICIENT("充足", d -> d.compareTo(new BigDecimal("30")) > 0),
    WARNING("偏低", d -> d.compareTo(new BigDecimal("7")) >= 0),
    CRITICAL("告急", d -> true);

    private final String displayName;
    private final Predicate<BigDecimal> condition;

    StatusLevel(String displayName, Predicate<BigDecimal> condition) {
        this.displayName = displayName;
        this.condition = condition;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static StatusLevel fromDays(BigDecimal days) {
        for (StatusLevel level : values()) {
            if (level.condition.test(days)) return level;
        }
        return CRITICAL;
    }
}
