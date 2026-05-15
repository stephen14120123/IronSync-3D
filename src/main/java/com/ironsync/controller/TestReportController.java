package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;

@Tag(name = "测试报告", description = "E2E 测试报告查看接口（仅 CI 环境可用）")
@RestController
@RequestMapping("/api/test")
public class TestReportController {

    @Value("${ironsync.test-reports-path:deploy/test-reports}")
    private String reportsPath;

    private final ObjectMapper objectMapper;

    public TestReportController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Operation(summary = "获取最新测试报告", description = "读取最近一次 E2E 测试的输出报告（JSON 格式）")
    @ApiResponse(responseCode = "200", description = "成功返回测试报告数据或空对象")
    @GetMapping("/report/latest")
    public Result<Map<String, Object>> getLatestReport() {
        Path metaFile = Paths.get(reportsPath, "latest", "report-meta.json");
        if (Files.exists(metaFile)) {
            try {
                String content = Files.readString(metaFile);
                @SuppressWarnings("unchecked")
                Map<String, Object> data = objectMapper.readValue(content, Map.class);
                return Result.success(data);
            } catch (IOException e) {
                return Result.success(Collections.emptyMap());
            }
        }
        return Result.success(Collections.emptyMap());
    }
}
