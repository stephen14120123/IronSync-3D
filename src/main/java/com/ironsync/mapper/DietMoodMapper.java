package com.ironsync.mapper;

import com.ironsync.entity.DietMood;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DietMoodMapper {

    int insert(DietMood dietMood);

    DietMood selectById(Long id);

    int update(DietMood dietMood);

    int deleteById(Long id);

    List<DietMood> selectByDateRange(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
