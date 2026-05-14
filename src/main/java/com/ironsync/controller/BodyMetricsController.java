package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.request.BodyMetricsCreateDTO;
import com.ironsync.dto.request.BodyMetricsUpdateDTO;
import com.ironsync.dto.response.BodyMetricsVO;
import com.ironsync.service.BodyMetricsService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/body-metrics")
public class BodyMetricsController {

    private final BodyMetricsService bodyMetricsService;

    public BodyMetricsController(BodyMetricsService bodyMetricsService) {
        this.bodyMetricsService = bodyMetricsService;
    }

    @PostMapping
    public Result<BodyMetricsVO> create(@Valid @RequestBody BodyMetricsCreateDTO dto) {
        return Result.success(bodyMetricsService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<BodyMetricsVO> update(@PathVariable Long id, @Valid @RequestBody BodyMetricsUpdateDTO dto) {
        dto.setId(id);
        return Result.success(bodyMetricsService.update(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        bodyMetricsService.deleteById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<BodyMetricsVO> findById(@PathVariable Long id) {
        return Result.success(bodyMetricsService.findById(id));
    }

    @GetMapping
    public Result<List<BodyMetricsVO>> findByDateRange(
            @RequestParam("from") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate to) {
        return Result.success(bodyMetricsService.findByDateRange(from, to));
    }
}
