package com.ironsync.common.auth;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenManager {

    private final Map<String, String> tokenUserMap = new ConcurrentHashMap<>();

    public String createToken(String username) {
        String token = java.util.UUID.randomUUID().toString();
        tokenUserMap.put(token, username);
        return token;
    }

    public boolean validateToken(String token) {
        return token != null && tokenUserMap.containsKey(token);
    }

    public String getUsername(String token) {
        return tokenUserMap.get(token);
    }

    public void removeToken(String token) {
        tokenUserMap.remove(token);
    }

    public Set<String> getActiveTokens() {
        return Collections.unmodifiableSet(tokenUserMap.keySet());
    }
}
