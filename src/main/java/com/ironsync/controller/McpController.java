package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.response.McpSearchResultVO;
import com.ironsync.service.mcp.McpDiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "MCP 日记", description = "MCP Markdown 日记搜索、内容预览和缓存刷新接口")
@RestController
@RequestMapping("/api/mcp")
public class McpController {

    private final McpDiaryService mcpDiaryService;

    public McpController(McpDiaryService mcpDiaryService) {
        this.mcpDiaryService = mcpDiaryService;
    }

    @Operation(summary = "搜索日记", description = "全文搜索 Markdown 日记，支持多关键词 AND 逻辑匹配（空格分隔）")
    @ApiResponse(responseCode = "200", description = "成功返回匹配结果列表")
    @GetMapping("/search")
    public Result<List<McpSearchResultVO>> search(@RequestParam("q") String keyword) {
        return Result.success(mcpDiaryService.search(keyword));
    }

    @Operation(summary = "获取日记内容", description = "按路径获取单篇 Markdown 日记的 HTML 渲染内容")
    @ApiResponse(responseCode = "200", description = "成功返回 HTML 内容")
    @GetMapping("/content")
    public Result<Map<String, String>> content(@RequestParam("path") String filePath) {
        String html = mcpDiaryService.renderHtml(filePath);
        return Result.success(Map.of("html", html));
    }

    @Operation(summary = "刷新缓存", description = "手动触发 MCP 日记缓存刷新，重新扫描日记目录")
    @ApiResponse(responseCode = "200", description = "刷新成功")
    @PostMapping("/refresh")
    public Result<Void> refresh() {
        mcpDiaryService.refreshCache();
        return Result.success();
    }
}
