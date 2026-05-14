package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@RestController
@RequestMapping("/api/test")
public class TestReportController {

    @Value("${ironsync.test-reports-path:deploy/test-reports}")
    private String reportsPath;

    private final ObjectMapper objectMapper;

    public TestReportController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

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
