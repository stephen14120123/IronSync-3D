package com.ironsync.controller;

import com.ironsync.common.auth.TokenManager;
import com.ironsync.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Tag(name = "认证", description = "用户登录、注册与 Token 认证接口")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** 内置管理员账号 */
    private static final String ADMIN_USER = "admin";
    private static final String ADMIN_PASS = "123456";

    /** 注册用户存储（demo 阶段暂存内存，重启即重置） */
    private final Map<String, String> registeredUsers = new ConcurrentHashMap<>();

    private final TokenManager tokenManager;

    public AuthController(TokenManager tokenManager) {
        this.tokenManager = tokenManager;
    }

    @Operation(summary = "登录", description = "用户名密码校验，返回 Token。支持 admin 内置账号及已注册用户")
    @ApiResponse(responseCode = "200", description = "登录成功返回 token")
    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null || username.isBlank() || password.isBlank()) {
            return Result.error(400, "用户名和密码不能为空");
        }

        // 校验：内置管理员 或 已注册用户
        boolean valid = (ADMIN_USER.equals(username) && ADMIN_PASS.equals(password))
                     || (password.equals(registeredUsers.get(username)));

        if (!valid) {
            return Result.error(401, "用户名或密码错误");
        }

        String token = tokenManager.createToken(username);
        return Result.success(Map.of("token", token, "username", username));
    }

    @Operation(summary = "注册", description = "注册新用户，用户名不能重复。注册成功后自动返回登录态 Token")
    @ApiResponse(responseCode = "200", description = "注册成功返回 token")
    @PostMapping("/register")
    public Result<Map<String, String>> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null || username.isBlank() || password.isBlank()) {
            return Result.error(400, "用户名和密码不能为空");
        }
        if (username.length() < 2 || username.length() > 20) {
            return Result.error(400, "用户名长度需在 2-20 个字符之间");
        }
        if (password.length() < 4) {
            return Result.error(400, "密码长度不能少于 4 位");
        }
        if (ADMIN_USER.equals(username)) {
            return Result.error(400, "该用户名已被注册");
        }
        if (registeredUsers.putIfAbsent(username, password) != null) {
            return Result.error(400, "该用户名已被注册");
        }

        String token = tokenManager.createToken(username);
        return Result.success(Map.of("token", token, "username", username));
    }
}
