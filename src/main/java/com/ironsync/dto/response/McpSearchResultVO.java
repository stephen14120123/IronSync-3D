package com.ironsync.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McpSearchResultVO {
    private String filePath;
    private String title;
    private String snippet;
    private List<Integer> matchLines;
}
