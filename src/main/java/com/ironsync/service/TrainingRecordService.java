package com.ironsync.service;

import com.github.pagehelper.PageInfo;
import com.ironsync.dto.request.TrainingRecordCreateDTO;
import com.ironsync.dto.request.TrainingRecordUpdateDTO;
import com.ironsync.dto.response.TrainingRecordVO;
import com.ironsync.entity.TrainingRecord;

import java.time.LocalDate;
import java.util.List;

public interface TrainingRecordService {

    TrainingRecordVO create(TrainingRecordCreateDTO dto);

    TrainingRecordVO update(TrainingRecordUpdateDTO dto);

    void deleteById(Long id);

    TrainingRecordVO findById(Long id);

    List<TrainingRecordVO> findByDate(LocalDate date);

    List<TrainingRecord> findByDateRaw(LocalDate date);

    List<TrainingRecordVO> findAll();

    PageInfo<TrainingRecordVO> findAll(int page, int size);

    List<TrainingRecordVO> findAllForChart();
}
