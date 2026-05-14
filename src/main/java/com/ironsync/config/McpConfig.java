package com.ironsync.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ironsync.mcp")
public class McpConfig {

    private String diaryPath = "./notes";
}
