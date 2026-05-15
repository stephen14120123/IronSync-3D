package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.request.SupplementCreateDTO;
import com.ironsync.dto.request.SupplementUpdateDTO;
import com.ironsync.dto.response.SupplementStatusVO;
import com.ironsync.dto.response.SupplementVO;
import com.ironsync.service.SupplementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplements")
public class SupplementController {

    private final SupplementService supplementService;

    public SupplementController(SupplementService supplementService) {
        this.supplementService = supplementService;
    }

    @PostMapping
    public Result<SupplementVO> create(@Valid @RequestBody SupplementCreateDTO dto) {
        return Result.success(supplementService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<SupplementVO> update(@PathVariable Long id, @Valid @RequestBody SupplementUpdateDTO dto) {
        dto.setId(id);
        return Result.success(supplementService.update(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        supplementService.deleteById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<SupplementVO> findById(@PathVariable Long id) {
        return Result.success(supplementService.findById(id));
    }

    @GetMapping
    public Result<List<SupplementVO>> findAll() {
        return Result.success(supplementService.findAll());
    }

    @GetMapping("/status")
    public Result<List<SupplementStatusVO>> getStatus() {
        return Result.success(supplementService.getStatusList());
    }
}
