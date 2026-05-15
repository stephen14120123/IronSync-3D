package com.ironsync.controller;

import com.ironsync.common.auth.TokenManager;
import com.ironsync.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "认证", description = "用户登录与 Token 认证接口")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final TokenManager tokenManager;

    public AuthController(TokenManager tokenManager) {
        this.tokenManager = tokenManager;
    }

    @Operation(summary = "登录", description = "用户名密码校验，返回 Token。当前单用户阶段账号 admin / 123456")
    @ApiResponse(responseCode = "200", description = "登录成功返回 token")
    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (!"admin".equals(username) || !"123456".equals(password)) {
            return Result.error(401, "用户名或密码错误");
        }

        String token = tokenManager.createToken(username);
        return Result.success(Map.of("token", token, "username", username));
    }
}
