package com.ironsync.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "MCP 日记搜索结果响应体")
public class McpSearchResultVO {
    @Schema(description = "文件路径", example = "notes/2025-06-01.md")
    private String filePath;

    @Schema(description = "标题", example = "2025-06-01 训练日记")
    private String title;

    @Schema(description = "摘要片段", example = "今天深蹲做了 5x5，感觉不错...")
    private String snippet;

    @Schema(description = "匹配行号列表", example = "[3, 7, 15]")
    private List<Integer> matchLines;
}
