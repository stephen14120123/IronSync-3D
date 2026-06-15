package com.ironsync.controller;

import com.github.pagehelper.PageInfo;
import com.ironsync.common.result.Result;
import com.ironsync.dto.request.TrainingRecordCreateDTO;
import com.ironsync.dto.request.TrainingRecordUpdateDTO;
import com.ironsync.dto.response.TrainingRecordVO;
import com.ironsync.dto.response.WeeklyVolumeVO;
import com.ironsync.service.TrainingRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "训练记录", description = "训练记录的增删改查、图表数据、按日期查询等接口")
@RestController
@RequestMapping("/api/training-records")
public class TrainingRecordController {

    private final TrainingRecordService trainingRecordService;

    public TrainingRecordController(TrainingRecordService trainingRecordService) {
        this.trainingRecordService = trainingRecordService;
    }

    @Operation(summary = "创建训练记录", description = "新增一条训练记录，包含动作、重量、组数、次数、RPE")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping
    public Result<TrainingRecordVO> create(@Valid @RequestBody TrainingRecordCreateDTO dto) {
        return Result.success(trainingRecordService.create(dto));
    }

    @Operation(summary = "更新训练记录", description = "按 ID 更新训练记录的所有字段")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}")
    public Result<TrainingRecordVO> update(@PathVariable Long id, @Valid @RequestBody TrainingRecordUpdateDTO dto) {
        dto.setId(id);
        return Result.success(trainingRecordService.update(dto));
    }

    @Operation(summary = "删除训练记录", description = "按 ID 逻辑删除训练记录")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        trainingRecordService.deleteById(id);
        return Result.success();
    }

    @Operation(summary = "查询训练记录", description = "按 ID 查询单条训练记录的详细信息")
    @ApiResponse(responseCode = "200", description = "成功返回数据")
    @GetMapping("/{id}")
    public Result<TrainingRecordVO> findById(@PathVariable Long id) {
        return Result.success(trainingRecordService.findById(id));
    }

    @Operation(summary = "分页查询训练记录", description = "分页获取训练记录列表，支持页码和每页条数参数（size 上限 50）")
    @ApiResponse(responseCode = "200", description = "成功返回分页数据")
    @GetMapping
    public Result<PageInfo<TrainingRecordVO>> findAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        // 防御性上限：防全表扫描
        if (size > 50) size = 50;
        if (page < 1) page = 1;
        return Result.success(trainingRecordService.findAll(page, size));
    }

    @Operation(summary = "获取图表数据", description = "获取所有未删除的训练记录用于前端 ECharts 图表展示")
    @ApiResponse(responseCode = "200", description = "成功返回数据")
    @GetMapping("/chart")
    public Result<List<TrainingRecordVO>> chart() {
        return Result.success(trainingRecordService.findAllForChart());
    }

    @Operation(summary = "按日期查询", description = "按指定日期查询当天的训练记录")
    @ApiResponse(responseCode = "200", description = "成功返回数据")
    @GetMapping("/by-date")
    public Result<List<TrainingRecordVO>> findByDate(
            @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(trainingRecordService.findByDate(date));
    }

    @Operation(summary = "查询今日训练", description = "快捷查询今天的训练记录")
    @ApiResponse(responseCode = "200", description = "成功返回数据")
    @GetMapping("/today")
    public Result<List<TrainingRecordVO>> today() {
        return Result.success(trainingRecordService.findByDate(LocalDate.now()));
    }

    @Operation(summary = "获取周训练容量", description = "最近 4 周的每周总训练容量柱状图数据")
    @ApiResponse(responseCode = "200", description = "成功返回每周训练容量列表")
    @GetMapping("/weekly-volume")
    public Result<List<WeeklyVolumeVO>> weeklyVolume() {
        return Result.success(trainingRecordService.getWeeklyVolume());
    }
}
