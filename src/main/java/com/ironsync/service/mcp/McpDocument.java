package com.ironsync.service.mcp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McpDocument {
    private String filePath;
    private String fileName;
    private String title;
    private String plainText;
    private List<String> lines;
}
