package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.response.McpSearchResultVO;
import com.ironsync.service.mcp.McpDiaryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mcp")
public class McpController {

    private final McpDiaryService mcpDiaryService;

    public McpController(McpDiaryService mcpDiaryService) {
        this.mcpDiaryService = mcpDiaryService;
    }

    @GetMapping("/search")
    public Result<List<McpSearchResultVO>> search(@RequestParam("q") String keyword) {
        return Result.success(mcpDiaryService.search(keyword));
    }

    @GetMapping("/content")
    public Result<Map<String, String>> content(@RequestParam("path") String filePath) {
        String html = mcpDiaryService.renderHtml(filePath);
        return Result.success(Map.of("html", html));
    }

    @PostMapping("/refresh")
    public Result<Void> refresh() {
        mcpDiaryService.refreshCache();
        return Result.success();
    }
}
