package com.ironsync.common.exception;

public enum ErrorCode {
    // 通用
    SUCCESS(200, "success"),
    BAD_REQUEST(400, "请求参数错误"),
    NOT_FOUND(404, "资源不存在"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    // 业务
    TRAINING_RECORD_NOT_FOUND(404, "训练记录不存在"),
    SUPPLEMENT_NOT_FOUND(404, "补剂记录不存在"),
    DIET_MOOD_NOT_FOUND(404, "饮食情绪记录不存在"),
    BODY_METRICS_NOT_FOUND(404, "身体指标记录不存在");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
