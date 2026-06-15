package com.ironsync.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoodRecord {
    private Long id;
    private Long userId;
    private LocalDate recordDate;
    private Integer moodScore;
}
