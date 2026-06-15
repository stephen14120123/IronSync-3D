package com.ironsync.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "个人统计响应体")
public class ProfileStatsVO {

    @Schema(description = "用户名", example = "admin")
    private String username;

    @Schema(description = "已坚持天数", example = "30")
    private Long daysJoined;

    @Schema(description = "累计训练天数", example = "24")
    private Long totalWorkouts;

    @Schema(description = "累计总组数", example = "186")
    private Long totalSets;

    @Schema(description = "累计总容量(kg)", example = "12450")
    private BigDecimal totalVolumeKg;

    @Schema(description = "累计总消耗(kcal)", example = "8450")
    private BigDecimal totalCalories;

    @Schema(description = "最近体重(kg)", example = "75.5")
    private BigDecimal latestWeight;

    @Schema(description = "体重变化(较7天前)", example = "-0.5")
    private BigDecimal weightDelta;

    @Schema(description = "最近体脂率(%)", example = "15.2")
    private BigDecimal latestBodyFat;

    @Schema(description = "体脂率变化(较7天前)", example = "-0.3")
    private BigDecimal bodyFatDelta;

    @Schema(description = "身高(cm)", example = "175")
    private BigDecimal heightCm;

    @Schema(description = "健身目标", example = "增肌减脂")
    private String goal;
}
