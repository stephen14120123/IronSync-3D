package com.ironsync.service.impl;

import com.ironsync.dto.request.TrainingRecordCreateDTO;
import com.ironsync.dto.request.TrainingRecordUpdateDTO;
import com.ironsync.dto.response.TrainingRecordVO;
import com.ironsync.entity.TrainingRecord;
import com.ironsync.mapper.TrainingRecordMapper;
import com.ironsync.service.TrainingRecordService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainingRecordServiceImpl implements TrainingRecordService {

    private final TrainingRecordMapper trainingRecordMapper;

    public TrainingRecordServiceImpl(TrainingRecordMapper trainingRecordMapper) {
        this.trainingRecordMapper = trainingRecordMapper;
    }

    @Override
    @Transactional
    public TrainingRecordVO create(TrainingRecordCreateDTO dto) {
        TrainingRecord entity = new TrainingRecord();
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(1L);
        entity.setDeleted(0);
        trainingRecordMapper.insert(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public TrainingRecordVO update(TrainingRecordUpdateDTO dto) {
        TrainingRecord entity = trainingRecordMapper.selectById(dto.getId());
        if (entity == null) {
            throw new com.ironsync.common.exception.BusinessException("训练记录不存在");
        }
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(1L);
        trainingRecordMapper.update(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        trainingRecordMapper.deleteById(id);
    }

    @Override
    public TrainingRecordVO findById(Long id) {
        TrainingRecord entity = trainingRecordMapper.selectById(id);
        return entity != null ? toVO(entity) : null;
    }

    @Override
    public List<TrainingRecordVO> findByDate(LocalDate date) {
        List<TrainingRecord> list = trainingRecordMapper.selectByRecordDate(date);
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public List<TrainingRecord> findByDateRaw(LocalDate date) {
        return trainingRecordMapper.selectByRecordDate(date);
    }

    @Override
    public List<TrainingRecordVO> findAll() {
        List<TrainingRecord> list = trainingRecordMapper.selectAll(1L);
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    private TrainingRecordVO toVO(TrainingRecord entity) {
        if (entity == null) return null;
        TrainingRecordVO vo = new TrainingRecordVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }
}
