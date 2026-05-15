package com.ironsync.controller;

import com.github.pagehelper.PageInfo;
import com.ironsync.common.result.Result;
import com.ironsync.dto.request.TrainingRecordCreateDTO;
import com.ironsync.dto.request.TrainingRecordUpdateDTO;
import com.ironsync.dto.response.TrainingRecordVO;
import com.ironsync.service.TrainingRecordService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/training-records")
public class TrainingRecordController {

    private final TrainingRecordService trainingRecordService;

    public TrainingRecordController(TrainingRecordService trainingRecordService) {
        this.trainingRecordService = trainingRecordService;
    }

    @PostMapping
    public Result<TrainingRecordVO> create(@Valid @RequestBody TrainingRecordCreateDTO dto) {
        return Result.success(trainingRecordService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<TrainingRecordVO> update(@PathVariable Long id, @Valid @RequestBody TrainingRecordUpdateDTO dto) {
        dto.setId(id);
        return Result.success(trainingRecordService.update(dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        trainingRecordService.deleteById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<TrainingRecordVO> findById(@PathVariable Long id) {
        return Result.success(trainingRecordService.findById(id));
    }

    @GetMapping
    public Result<PageInfo<TrainingRecordVO>> findAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(trainingRecordService.findAll(page, size));
    }

    @GetMapping("/chart")
    public Result<List<TrainingRecordVO>> chart() {
        return Result.success(trainingRecordService.findAllForChart());
    }

    @GetMapping("/by-date")
    public Result<List<TrainingRecordVO>> findByDate(
            @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(trainingRecordService.findByDate(date));
    }

    @GetMapping("/today")
    public Result<List<TrainingRecordVO>> today() {
        return Result.success(trainingRecordService.findByDate(LocalDate.now()));
    }
}
