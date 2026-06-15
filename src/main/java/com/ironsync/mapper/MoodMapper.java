package com.ironsync.mapper;

import com.ironsync.entity.MoodRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

@Mapper
public interface MoodMapper {

    int insert(MoodRecord record);

    MoodRecord selectByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    int update(MoodRecord record);
}
