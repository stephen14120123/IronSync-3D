package com.ironsync.mapper;

import com.ironsync.entity.TrainingRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface TrainingRecordMapper {

    int insert(TrainingRecord trainingRecord);

    TrainingRecord selectById(Long id);

    int update(TrainingRecord trainingRecord);

    int deleteById(Long id);

    List<TrainingRecord> selectByRecordDate(LocalDate date);

    List<TrainingRecord> selectAll(@Param("userId") Long userId);
}
