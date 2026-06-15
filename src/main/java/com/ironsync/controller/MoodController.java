package com.ironsync.controller;

import com.ironsync.common.auth.CurrentUser;
import com.ironsync.common.result.Result;
import com.ironsync.entity.MoodRecord;
import com.ironsync.mapper.MoodMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@Tag(name = "情绪", description = "每日情绪打卡")
@RestController
@RequestMapping("/api/mood")
public class MoodController {

    private final MoodMapper moodMapper;

    public MoodController(MoodMapper moodMapper) {
        this.moodMapper = moodMapper;
    }

    @Operation(summary = "获取今日情绪", description = "返回今日情绪评分，未记录则返回 null")
    @GetMapping("/today")
    public Result<Map<String, Object>> getToday() {
        MoodRecord record = moodMapper.selectByUserAndDate(CurrentUser.getUserId(), LocalDate.now());
        return Result.success(Map.of(
                "moodScore", record != null ? record.getMoodScore() : null
        ));
    }

    @Operation(summary = "记录/更新今日情绪", description = "保存今日情绪评分 1-10")
    @PostMapping("/today")
    public Result<Void> saveToday(@RequestBody Map<String, Integer> body) {
        Integer score = body.get("moodScore");
        if (score == null || score < 1 || score > 10) {
            return Result.error(400, "情绪评分需在 1-10 之间");
        }

        long userId = CurrentUser.getUserId();
        LocalDate today = LocalDate.now();

        MoodRecord existing = moodMapper.selectByUserAndDate(userId, today);
        if (existing != null) {
            existing.setMoodScore(score);
            moodMapper.update(existing);
        } else {
            MoodRecord record = MoodRecord.builder()
                    .userId(userId)
                    .recordDate(today)
                    .moodScore(score)
                    .build();
            moodMapper.insert(record);
        }

        return Result.success();
    }
}
