package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.service.mesh.MeshMappingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "3D 模型映射", description = "3D 人体模型的 Mesh 高亮映射接口")
@RestController
@RequestMapping("/api/mesh")
public class MeshController {

    private final MeshMappingService meshMappingService;

    public MeshController(MeshMappingService meshMappingService) {
        this.meshMappingService = meshMappingService;
    }

    @Operation(summary = "获取高亮 Mesh 列表", description = "根据训练动作名称列表，返回对应的 3D 模型网格名称用于前端高亮")
    @ApiResponse(responseCode = "200", description = "成功返回 Mesh 名称列表")
    @GetMapping("/highlight")
    public Result<List<String>> highlight(@RequestParam("actions") List<String> actions) {
        List<String> meshNames = meshMappingService.getMeshNames(actions);
        return Result.success(meshNames);
    }
}
