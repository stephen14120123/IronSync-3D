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

    List<TrainingRecord> selectByRecordDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    List<TrainingRecord> selectAll(@Param("userId") Long userId);

    /** 防全表扫描：最多返回 50 条最近记录（供图表/周容量使用） */
    List<TrainingRecord> selectRecent(@Param("userId") Long userId);

    /** 累计训练天数 */
    long countDistinctTrainingDays(@Param("userId") Long userId);
}
