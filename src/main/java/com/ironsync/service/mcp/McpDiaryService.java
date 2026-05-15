package com.ironsync.service.mcp;

import com.ironsync.config.McpConfig;
import com.ironsync.dto.response.McpSearchResultVO;
import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Document;
import com.vladsch.flexmark.util.data.MutableDataSet;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class McpDiaryService {

    private static final Logger log = LoggerFactory.getLogger(McpDiaryService.class);

    private final McpConfig mcpConfig;
    private final Parser parser;
    private final HtmlRenderer htmlRenderer;

    private final List<McpDocument> cache = new ArrayList<>();

    public McpDiaryService(McpConfig mcpConfig) {
        this.mcpConfig = mcpConfig;
        MutableDataSet options = new MutableDataSet();
        this.parser = Parser.builder(options).build();
        this.htmlRenderer = HtmlRenderer.builder(options).build();
    }

    @PostConstruct
    public void initCache() {
        Path diaryPath = Paths.get(mcpConfig.getDiaryPath());
        if (!Files.exists(diaryPath) || !Files.isDirectory(diaryPath)) {
            log.warn("MCP 日记目录不存在，跳过缓存初始化: {}", diaryPath.toAbsolutePath());
            return;
        }

        cache.clear();
        try (Stream<Path> walk = Files.walk(diaryPath)) {
            walk.filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".md"))
                    .forEach(this::loadAndCache);
            log.info("MCP 缓存加载完成: {} 篇笔记", cache.size());
        } catch (IOException e) {
            log.error("MCP 日记目录遍历失败: {}", diaryPath.toAbsolutePath(), e);
        }
    }

    private void loadAndCache(Path filePath) {
        try {
            String raw = Files.readString(filePath, StandardCharsets.UTF_8);
            Document ast = parser.parse(raw);
            String plainText = extractPlainText(ast);

            List<String> lines = plainText.lines().collect(Collectors.toList());
            String fileName = filePath.getFileName().toString();
            String title = fileName.replaceAll("\\.md$", "");

            cache.add(McpDocument.builder()
                    .filePath(filePath.toString())
                    .fileName(fileName)
                    .title(title)
                    .plainText(plainText)
                    .lines(lines)
                    .build());
        } catch (IOException e) {
            log.warn("读取 MCP 文件失败: {}", filePath, e);
        }
    }

    public List<McpSearchResultVO> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String[] keywords = keyword.trim().toLowerCase().split("\\s+");
        List<McpSearchResultVO> results = new ArrayList<>();

        for (McpDocument doc : cache) {
            String lowerText = doc.getPlainText().toLowerCase();
            String lowerTitle = doc.getTitle().toLowerCase();

            // AND 逻辑：所有关键词必须匹配（标题或正文）
            boolean allMatch = true;
            for (String kw : keywords) {
                if (!lowerText.contains(kw) && !lowerTitle.contains(kw)) {
                    allMatch = false;
                    break;
                }
            }
            if (!allMatch) continue;

            // 收集匹配行（用第一个关键词作为主高亮）
            String primaryKw = keywords[0];
            List<Integer> matchLines = new ArrayList<>();
            for (int i = 0; i < doc.getLines().size(); i++) {
                if (doc.getLines().get(i).toLowerCase().contains(primaryKw)) {
                    matchLines.add(i + 1);
                }
            }

            String snippet = buildSnippet(doc.getLines(), matchLines);

            results.add(McpSearchResultVO.builder()
                    .filePath(doc.getFilePath())
                    .title(doc.getTitle())
                    .snippet(snippet)
                    .matchLines(matchLines)
                    .build());
        }

        return results;
    }

    public void refreshCache() {
        log.info("MCP 缓存手动刷新开始...");
        initCache();
    }

    public String renderHtml(String filePath) {
        try {
            // 1. 规范化安全目录根路径（解析符号链接、大小写、.. 等）
            Path diaryPath = Paths.get(mcpConfig.getDiaryPath()).toAbsolutePath().normalize();
            String canonicalRoot = diaryPath.toFile().getCanonicalPath();

            // 2. 规范化用户请求的目标路径
            Path target = Paths.get(filePath);
            if (!target.isAbsolute()) {
                target = diaryPath.resolve(target);
            }
            String canonicalTarget = target.toFile().getCanonicalPath();

            // 3. 绝对防御：目标必须在安全目录内（字符串前缀比较，已规避 Windows 大小写/反斜杠问题）
            if (!canonicalTarget.startsWith(canonicalRoot + File.separator)) {
                throw new SecurityException("路径穿越拒绝: " + filePath);
            }

            // 4. 检查文件存在
            Path resolvedTarget = Paths.get(canonicalTarget);
            if (!Files.exists(resolvedTarget) || !Files.isRegularFile(resolvedTarget)) {
                throw new IllegalArgumentException("文件不存在: " + filePath);
            }

            // 5. 读取渲染
            String raw = Files.readString(resolvedTarget, StandardCharsets.UTF_8);
            Document ast = parser.parse(raw);
            return htmlRenderer.render(ast);
        } catch (SecurityException e) {
            throw e;
        } catch (IOException e) {
            throw new RuntimeException("文件读取失败: " + filePath, e);
        }
    }

    private String buildSnippet(List<String> lines, List<Integer> matchLines) {
        if (matchLines.isEmpty()) return "";
        int idx = matchLines.get(0) - 1;
        int from = Math.max(0, idx - 2);
        int to = Math.min(lines.size(), idx + 3);
        return lines.subList(from, to).stream()
                .collect(Collectors.joining("\n"));
    }

    private String extractPlainText(Node node) {
        StringBuilder sb = new StringBuilder();
        extractText(node, sb);
        return sb.toString();
    }

    private void extractText(Node node, StringBuilder sb) {
        if (node instanceof com.vladsch.flexmark.ast.Text) {
            sb.append(node.getChars());
        }
        Node child = node.getFirstChild();
        while (child != null) {
            extractText(child, sb);
            child = child.getNext();
        }
    }
}
