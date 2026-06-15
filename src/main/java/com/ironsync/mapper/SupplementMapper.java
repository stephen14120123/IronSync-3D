package com.ironsync.mapper;

import com.ironsync.entity.Supplement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SupplementMapper {

    int insert(Supplement supplement);

    Supplement selectById(Long id);

    int update(Supplement supplement);

    int deleteById(Long id);

    List<Supplement> selectAll(@Param("userId") Long userId);
}
