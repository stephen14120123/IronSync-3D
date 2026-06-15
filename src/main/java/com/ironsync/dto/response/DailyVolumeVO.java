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
@Schema(description = "每日训练容量响应体")
public class DailyVolumeVO {

    @Schema(description = "星期几(一~日)", example = "一")
    private String dayLabel;

    @Schema(description = "当日总容量", example = "4500")
    private BigDecimal volume;
}
