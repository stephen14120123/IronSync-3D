package com.ironsync.common.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 当前登录用户上下文工具。
 * 从 AuthInterceptor 存入的 request attribute 中提取用户名，
 * 再映射到 userId（内存存储，重启即重置）。
 *
 * admin → id=1
 * 注册用户 → id 从 2 开始递增
 */
public class CurrentUser {

    private CurrentUser() {}

    /** username → userId 映射 */
    private static final Map<String, Long> userIdMap = new ConcurrentHashMap<>();
    private static final AtomicLong idCounter = new AtomicLong(1L);

    static {
        // admin 固定为 1
        userIdMap.put("admin", 1L);
    }

    /**
     * 注册新用户时分配 userId
     */
    public static long assignId(String username) {
        long id = idCounter.incrementAndGet();
        userIdMap.put(username, id);
        return id;
    }

    /**
     * 获取当前登录用户的 userId
     */
    public static long getUserId() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return 1L; // 防御性 fallback

        HttpServletRequest request = attrs.getRequest();
        String username = (String) request.getAttribute("currentUser");
        if (username == null) return 1L;

        return userIdMap.getOrDefault(username, 1L);
    }

    /**
     * 获取当前登录用户名
     */
    public static String getUsername() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return "admin";
        HttpServletRequest request = attrs.getRequest();
        String username = (String) request.getAttribute("currentUser");
        return username != null ? username : "admin";
    }
}
