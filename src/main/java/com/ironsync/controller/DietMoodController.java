package com.ironsync.controller;

import com.ironsync.common.result.Result;
import com.ironsync.dto.request.DietMoodCreateDTO;
import com.ironsync.dto.request.DietMoodUpdateDTO;
import com.ironsync.dto.response.DietMoodVO;
import com.ironsync.service.DietMoodService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diet-mood")
public class DietMoodController {

    private final DietMoodService dietMoodService;

    public DietMoodController(DietMoodService dietMoodService) {
        this.dietMoodService = dietMoodService;
    }

    @PostMapping
    public Result<DietMoodVO> create(@Valid @RequestBody DietMoodCreateDTO dto) {
        return Result.success(dietMoodService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<DietMoodVO> update(@PathVariable Long id, @Valid @RequestBody DietMoodUpdateDTO dto) {
        dto.setId(id);
        return Result.success(dietMoodService.update(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        dietMoodService.deleteById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<DietMoodVO> findById(@PathVariable Long id) {
        return Result.success(dietMoodService.findById(id));
    }

    @GetMapping
    public Result<List<DietMoodVO>> findByDateRange(
            @RequestParam("from") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate to) {
        return Result.success(dietMoodService.findByDateRange(from, to));
    }
}
