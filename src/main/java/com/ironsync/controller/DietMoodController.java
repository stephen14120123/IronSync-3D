package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.request.DietMoodCreateDTO;
import com.ironsync.dto.request.DietMoodUpdateDTO;
import com.ironsync.dto.response.DietMoodVO;
import com.ironsync.service.DietMoodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "饮食情绪", description = "饮食摄入（碳蛋脂）与情绪评分的增删改查接口")
@RestController
@RequestMapping("/api/diet-mood")
public class DietMoodController {

    private final DietMoodService dietMoodService;

    public DietMoodController(DietMoodService dietMoodService) {
        this.dietMoodService = dietMoodService;
    }

    @Operation(summary = "创建饮食记录", description = "新增一条饮食情绪记录（碳水化合物、蛋白质、脂肪 + 情绪评分）")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping
    public Result<DietMoodVO> create(@Valid @RequestBody DietMoodCreateDTO dto) {
        return Result.success(dietMoodService.create(dto));
    }

    @Operation(summary = "更新饮食记录", description = "按 ID 更新饮食情绪记录")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}")
    public Result<DietMoodVO> update(@PathVariable Long id, @Valid @RequestBody DietMoodUpdateDTO dto) {
        dto.setId(id);
        return Result.success(dietMoodService.update(dto));
    }

    @Operation(summary = "删除饮食记录", description = "按 ID 删除饮食情绪记录")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        dietMoodService.deleteById(id);
        return Result.success();
    }

    @Operation(summary = "查询饮食记录", description = "按 ID 查询单条饮食情绪记录")
    @ApiResponse(responseCode = "200", description = "成功返回数据")
    @GetMapping("/{id}")
    public Result<DietMoodVO> findById(@PathVariable Long id) {
        return Result.success(dietMoodService.findById(id));
    }

    @Operation(summary = "按日期范围查询", description = "查询指定日期范围内的饮食情绪记录")
    @ApiResponse(responseCode = "200", description = "成功返回数据列表")
    @GetMapping
    public Result<List<DietMoodVO>> findByDateRange(
            @RequestParam("from") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate to) {
        return Result.success(dietMoodService.findByDateRange(from, to));
    }
}
