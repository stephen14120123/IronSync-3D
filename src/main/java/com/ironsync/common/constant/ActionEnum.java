package com.ironsync.common.constant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ActionEnum {
    BARBELL_SQUAT("杠铃深蹲"),
    ROMANIAN_DEADLIFT("罗马尼亚硬拉"),
    BENCH_PRESS("卧推"),
    OVERHEAD_PRESS("推举"),
    PULL_UP("引体向上");

    private final String displayName;

    ActionEnum(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    @JsonCreator
    public static ActionEnum fromDisplayName(String displayName) {
        for (ActionEnum e : values()) {
            if (e.displayName.equals(displayName)) return e;
        }
        throw new IllegalArgumentException("未知动作: " + displayName);
    }
}
