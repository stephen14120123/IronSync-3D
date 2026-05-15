package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.service.mesh.MeshMappingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mesh")
public class MeshController {

    private final MeshMappingService meshMappingService;

    public MeshController(MeshMappingService meshMappingService) {
        this.meshMappingService = meshMappingService;
    }

    @GetMapping("/highlight")
    public Result<List<String>> highlight(@RequestParam("actions") List<String> actions) {
        List<String> meshNames = meshMappingService.getMeshNames(actions);
        return Result.success(meshNames);
    }
}
