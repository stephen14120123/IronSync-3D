package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.request.BodyMetricsCreateDTO;
import com.ironsync.dto.request.BodyMetricsUpdateDTO;
import com.ironsync.dto.response.BodyMetricsVO;
import com.ironsync.service.BodyMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "身体指标", description = "身体指标（体重、体脂率等）的增删改查接口")
@RestController
@RequestMapping("/api/body-metrics")
public class BodyMetricsController {

    private final BodyMetricsService bodyMetricsService;

    public BodyMetricsController(BodyMetricsService bodyMetricsService) {
        this.bodyMetricsService = bodyMetricsService;
    }

    @Operation(summary = "创建身体指标", description = "新增一条身体指标记录（体重、体脂率等）")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping
    public Result<BodyMetricsVO> create(@Valid @RequestBody BodyMetricsCreateDTO dto) {
        return Result.success(bodyMetricsService.create(dto));
    }

    @Operation(summary = "更新身体指标", description = "按 ID 更新身体指标记录")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}")
    public Result<BodyMetricsVO> update(@PathVariable Long id, @Valid @RequestBody BodyMetricsUpdateDTO dto) {
        dto.setId(id);
        return Result.success(bodyMetricsService.update(dto));
    }

    @Operation(summary = "删除身体指标", description = "按 ID 删除身体指标记录")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        bodyMetricsService.deleteById(id);
        return Result.success();
    }

    @Operation(summary = "查询身体指标", description = "按 ID 查询单条身体指标详细信息")
    @ApiResponse(responseCode = "200", description = "成功返回数据")
    @GetMapping("/{id}")
    public Result<BodyMetricsVO> findById(@PathVariable Long id) {
        return Result.success(bodyMetricsService.findById(id));
    }

    @Operation(summary = "按日期范围查询", description = "查询指定日期范围内的身体指标记录")
    @ApiResponse(responseCode = "200", description = "成功返回数据列表")
    @GetMapping
    public Result<List<BodyMetricsVO>> findByDateRange(
            @RequestParam("from") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate to) {
        return Result.success(bodyMetricsService.findByDateRange(from, to));
    }
}
