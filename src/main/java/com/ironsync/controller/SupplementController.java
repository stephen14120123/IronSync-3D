package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.request.SupplementCreateDTO;
import com.ironsync.dto.request.SupplementUpdateDTO;
import com.ironsync.dto.response.SupplementStatusVO;
import com.ironsync.dto.response.SupplementVO;
import com.ironsync.service.SupplementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "补剂管理", description = "补剂库存的增删改查、库存状态预警等接口")
@RestController
@RequestMapping("/api/supplements")
public class SupplementController {

    private final SupplementService supplementService;

    public SupplementController(SupplementService supplementService) {
        this.supplementService = supplementService;
    }

    @Operation(summary = "创建补剂", description = "新增一种补剂库存记录")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping
    public Result<SupplementVO> create(@Valid @RequestBody SupplementCreateDTO dto) {
        return Result.success(supplementService.create(dto));
    }

    @Operation(summary = "更新补剂", description = "按 ID 更新补剂信息（名称、库存量、每日消耗量）")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}")
    public Result<SupplementVO> update(@PathVariable Long id, @Valid @RequestBody SupplementUpdateDTO dto) {
        dto.setId(id);
        return Result.success(supplementService.update(dto));
    }

    @Operation(summary = "删除补剂", description = "按 ID 删除补剂记录")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        supplementService.deleteById(id);
        return Result.success();
    }

    @Operation(summary = "查询补剂", description = "按 ID 查询单条补剂详细信息")
    @ApiResponse(responseCode = "200", description = "成功返回数据")
    @GetMapping("/{id}")
    public Result<SupplementVO> findById(@PathVariable Long id) {
        return Result.success(supplementService.findById(id));
    }

    @Operation(summary = "查询所有补剂", description = "获取全部补剂列表，含动态库存状态")
    @ApiResponse(responseCode = "200", description = "成功返回列表")
    @GetMapping
    public Result<List<SupplementVO>> findAll() {
        return Result.success(supplementService.findAll());
    }

    @Operation(summary = "获取库存状态", description = "获取所有补剂的库存预警状态（充足/偏低/告急）及预估剩余天数")
    @ApiResponse(responseCode = "200", description = "成功返回状态列表")
    @GetMapping("/status")
    public Result<List<SupplementStatusVO>> getStatus() {
        return Result.success(supplementService.getStatusList());
    }
}
