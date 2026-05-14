package com.ironsync.mapper;

import com.ironsync.entity.BodyMetrics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface BodyMetricsMapper {

    int insert(BodyMetrics bodyMetrics);

    BodyMetrics selectById(Long id);

    int update(BodyMetrics bodyMetrics);

    int deleteById(Long id);

    List<BodyMetrics> selectByDateRange(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
