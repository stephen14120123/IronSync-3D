package com.ironsync.controller;

import com.ironsync.common.auth.CurrentUser;
import com.ironsync.common.result.Result;
import com.ironsync.dto.response.BodyMetricsVO;
import com.ironsync.dto.response.DailyCaloriesVO;
import com.ironsync.dto.response.DailyVolumeVO;
import com.ironsync.dto.response.DashboardSummaryVO;
import com.ironsync.dto.response.ProfileStatsVO;
import com.ironsync.dto.response.TrainingRecordVO;
import com.ironsync.entity.UserProfile;
import com.ironsync.service.BodyMetricsService;
import com.ironsync.service.TrainingRecordService;
import com.ironsync.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "数据大屏", description = "Bento Box 仪表盘摘要信息接口")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TrainingRecordService trainingRecordService;
    private final UserProfileService userProfileService;
    private final BodyMetricsService bodyMetricsService;

    public DashboardController(TrainingRecordService trainingRecordService,
                               UserProfileService userProfileService,
                               BodyMetricsService bodyMetricsService) {
        this.trainingRecordService = trainingRecordService;
        this.userProfileService = userProfileService;
        this.bodyMetricsService = bodyMetricsService;
    }

    @Operation(summary = "获取大屏摘要", description = "返回今日训练统计、热量消耗汇总及本周核心动作容量")
    @ApiResponse(responseCode = "200", description = "成功返回摘要数据")
    @GetMapping("/summary")
    public Result<DashboardSummaryVO> summary() {
        List<TrainingRecordVO> todayRecords = trainingRecordService.findByDate(LocalDate.now());
        BigDecimal totalCalories = trainingRecordService.calculateTodayCalories();

        int exerciseCount = todayRecords.size();
        int totalSets = todayRecords.stream().mapToInt(r -> r.getSets() != null ? r.getSets() : 0).sum();
        BigDecimal avgRpe = todayRecords.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf(todayRecords.stream()
                        .mapToDouble(r -> r.getRpe() != null ? r.getRpe().doubleValue() : 0)
                        .average().orElse(0))
                .setScale(1, RoundingMode.HALF_UP);

        // ---- Weekly volume for key exercises ----
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<TrainingRecordVO> recentRecords = trainingRecordService.findAllForChart();

        BigDecimal squatVolume = BigDecimal.ZERO;
        BigDecimal rdlVolume = BigDecimal.ZERO;

        for (TrainingRecordVO r : recentRecords) {
            if (r.getRecordDate() == null) continue;
            if (r.getRecordDate().isBefore(weekStart) || r.getRecordDate().isAfter(weekEnd)) continue;

            BigDecimal volume = BigDecimal.valueOf(r.getWeightKg().doubleValue() * r.getSets() * r.getReps());

            if ("杠铃深蹲".equals(r.getActionName())) {
                squatVolume = squatVolume.add(volume);
            } else if ("罗马尼亚硬拉".equals(r.getActionName())) {
                rdlVolume = rdlVolume.add(volume);
            }
        }

        long distinctDays = recentRecords.stream()
                .filter(r -> r.getRecordDate() != null && !r.getRecordDate().isBefore(weekStart) && !r.getRecordDate().isAfter(weekEnd))
                .map(TrainingRecordVO::getRecordDate)
                .distinct()
                .count();

        BigDecimal weekProgress = BigDecimal.valueOf(Math.min(distinctDays * 20, 100))
                .setScale(0, RoundingMode.HALF_UP);

        DashboardSummaryVO vo = DashboardSummaryVO.builder()
                .totalCalories(totalCalories)
                .targetCalories(BigDecimal.valueOf(600))
                .exerciseCount(exerciseCount)
                .totalSets(totalSets)
                .avgRpe(avgRpe)
                .squatVolume(squatVolume)
                .rdlVolume(rdlVolume)
                .weekProgress(weekProgress)
                .build();

        return Result.success(vo);
    }

    @Operation(summary = "获取个人统计", description = "返回用户名、累计训练数据、身体指标变化等个人统计信息")
    @ApiResponse(responseCode = "200", description = "成功返回个人统计数据")
    @GetMapping("/profile")
    public Result<ProfileStatsVO> profile() {
        String username = CurrentUser.getUsername();
        UserProfile profile = userProfileService.getProfile();

        // ---- Cumulative training stats (loaded first for potential fallback) ----
        List<TrainingRecordVO> allRecords = trainingRecordService.findAll();
        long totalSets = 0;
        BigDecimal totalVolumeKg = BigDecimal.ZERO;

        for (TrainingRecordVO r : allRecords) {
            int sets = r.getSets() != null ? r.getSets() : 0;
            totalSets += sets;
            if (r.getWeightKg() != null && sets > 0 && r.getReps() != null) {
                BigDecimal volume = BigDecimal.valueOf(r.getWeightKg().doubleValue() * sets * r.getReps());
                totalVolumeKg = totalVolumeKg.add(volume);
            }
        }

        // ---- Days joined — fall back to earliest training date if createdAt is null ----
        long daysJoined = 0;
        if (profile.getCreatedAt() != null) {
            daysJoined = ChronoUnit.DAYS.between(profile.getCreatedAt().toLocalDate(), LocalDate.now());
        } else if (!allRecords.isEmpty()) {
            // Existing users whose createdAt is NULL: use their first training day
            LocalDate earliest = allRecords.stream()
                    .map(TrainingRecordVO::getRecordDate)
                    .filter(d -> d != null)
                    .min(LocalDate::compareTo)
                    .orElse(LocalDate.now());
            daysJoined = ChronoUnit.DAYS.between(earliest, LocalDate.now());
        }
        // At least 1 if the user has any data
        if (daysJoined < 1 && (!allRecords.isEmpty() || profile.getCreatedAt() != null)) {
            daysJoined = 1;
        }

        // Total calories (same formula as today's: volume * 0.1)
        BigDecimal totalCalories = totalVolumeKg.multiply(BigDecimal.valueOf(0.1))
                .setScale(0, RoundingMode.HALF_UP);

        // Total workouts (distinct training days)
        long totalWorkouts = allRecords.stream()
                .map(TrainingRecordVO::getRecordDate)
                .filter(d -> d != null)
                .distinct()
                .count();

        // ---- Body metrics (latest + delta vs 7 days ago) ----
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(7);
        List<BodyMetricsVO> bodyRecords = bodyMetricsService.findByDateRange(sevenDaysAgo, today);

        BigDecimal latestWeight = null;
        BigDecimal latestBodyFat = null;
        BigDecimal weightDelta = null;
        BigDecimal bodyFatDelta = null;

        if (bodyRecords != null && !bodyRecords.isEmpty()) {
            BodyMetricsVO latest = bodyRecords.get(bodyRecords.size() - 1);
            latestWeight = latest.getWeightKg();
            latestBodyFat = latest.getBodyFatPercentage();

            // Find the oldest record in range for delta
            BodyMetricsVO oldest = bodyRecords.get(0);
            if (oldest.getWeightKg() != null && latestWeight != null) {
                weightDelta = latestWeight.subtract(oldest.getWeightKg()).setScale(1, RoundingMode.HALF_UP);
            }
            if (oldest.getBodyFatPercentage() != null && latestBodyFat != null) {
                bodyFatDelta = latestBodyFat.subtract(oldest.getBodyFatPercentage()).setScale(1, RoundingMode.HALF_UP);
            }
        }

        ProfileStatsVO vo = ProfileStatsVO.builder()
                .username(username)
                .daysJoined(daysJoined)
                .totalWorkouts(totalWorkouts)
                .totalSets(totalSets)
                .totalVolumeKg(totalVolumeKg.setScale(0, RoundingMode.HALF_UP))
                .totalCalories(totalCalories)
                .latestWeight(latestWeight)
                .weightDelta(weightDelta)
                .latestBodyFat(latestBodyFat)
                .bodyFatDelta(bodyFatDelta)
                .heightCm(profile.getHeightCm())
                .goal(profile.getGoal())
                .build();

        return Result.success(vo);
    }

    @Operation(summary = "获取本周每日训练容量", description = "返回本周一至周日每天的累计训练容量，用于前端柱状图展示")
    @ApiResponse(responseCode = "200", description = "成功返回每日容量列表")
    @GetMapping("/weekly-daily-volume")
    public Result<List<DailyVolumeVO>> weeklyDailyVolume() {
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        // Initialize 7 days with zero volume
        Map<LocalDate, DailyVolumeVO> dayMap = new LinkedHashMap<>();
        String[] labels = {"一", "二", "三", "四", "五", "六", "日"};
        for (int i = 0; i < 7; i++) {
            LocalDate d = weekStart.plusDays(i);
            dayMap.put(d, DailyVolumeVO.builder().dayLabel(labels[i]).volume(BigDecimal.ZERO).build());
        }

        List<TrainingRecordVO> allRecords = trainingRecordService.findAllForChart();
        for (TrainingRecordVO r : allRecords) {
            if (r.getRecordDate() == null) continue;
            if (r.getRecordDate().isBefore(weekStart) || r.getRecordDate().isAfter(weekEnd)) continue;
            if (r.getWeightKg() == null || r.getSets() == null || r.getReps() == null) continue;

            BigDecimal volume = BigDecimal.valueOf(r.getWeightKg().doubleValue() * r.getSets() * r.getReps());
            DailyVolumeVO existing = dayMap.get(r.getRecordDate());
            if (existing != null) {
                existing.setVolume(existing.getVolume().add(volume));
            }
        }

        return Result.success(new ArrayList<>(dayMap.values()));
    }

    @Operation(summary = "获取近 7 日每日热量消耗", description = "返回过去 7 天每天的累计热量消耗")
    @ApiResponse(responseCode = "200", description = "成功返回每日热量列表")
    @GetMapping("/weekly-calories")
    public Result<List<DailyCaloriesVO>> weeklyCalories() {
        List<TrainingRecordVO> allRecords = trainingRecordService.findAllForChart();

        // Build a map for the last 7 days
        Map<LocalDate, BigDecimal> dayCalories = new LinkedHashMap<>();
        String[] labels = {"一", "二", "三", "四", "五", "六", "日"};
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            dayCalories.put(today.minusDays(i), BigDecimal.ZERO);
        }

        // Group by date and calculate calories (volume * 0.1)
        for (TrainingRecordVO r : allRecords) {
            if (r.getRecordDate() == null) continue;
            BigDecimal existing = dayCalories.get(r.getRecordDate());
            if (existing == null) continue;
            if (r.getWeightKg() == null || r.getSets() == null || r.getReps() == null) continue;

            BigDecimal volume = BigDecimal.valueOf(r.getWeightKg().doubleValue() * r.getSets() * r.getReps());
            BigDecimal cal = volume.multiply(BigDecimal.valueOf(0.1));
            dayCalories.put(r.getRecordDate(), existing.add(cal));
        }

        // Convert to VO list
        List<DailyCaloriesVO> result = new ArrayList<>();
        for (Map.Entry<LocalDate, BigDecimal> entry : dayCalories.entrySet()) {
            LocalDate d = entry.getKey();
            result.add(DailyCaloriesVO.builder()
                    .dateLabel(String.format("%02d/%02d", d.getMonthValue(), d.getDayOfMonth()))
                    .dayLabel(String.format("%02d/%02d", d.getMonthValue(), d.getDayOfMonth()))
                    .calories(entry.getValue().setScale(0, RoundingMode.HALF_UP))
                    .build());
        }

        return Result.success(result);
    }
}
