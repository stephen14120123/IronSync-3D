package com.ironsync.common.interceptor;

import com.ironsync.common.auth.TokenManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private static final String WWW_AUTHENTICATE = "Bearer realm=\"IronSync-3D\"";

    private final TokenManager tokenManager;

    public AuthInterceptor(TokenManager tokenManager) {
        this.tokenManager = tokenManager;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.setHeader("WWW-Authenticate", WWW_AUTHENTICATE);
            response.getWriter().write("{\"code\":401,\"message\":\"未登录或 Token 已失效\",\"timestamp\":" + System.currentTimeMillis() + "}");
            return false;
        }

        String token = authHeader.substring(7);
        if (!tokenManager.validateToken(token)) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.setHeader("WWW-Authenticate", WWW_AUTHENTICATE);
            response.getWriter().write("{\"code\":401,\"message\":\"Token 无效或已过期\",\"timestamp\":" + System.currentTimeMillis() + "}");
            return false;
        }

        request.setAttribute("currentUser", tokenManager.getUsername(token));
        return true;
    }
}
