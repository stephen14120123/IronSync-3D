package com.ironsync.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final int code;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.code = errorCode.getCode();
    }

    public BusinessException(int code, String message) {
        super(message);
        this.errorCode = null;
        this.code = code;
    }

    public BusinessException(String message) {
        this(400, message);
    }
}
