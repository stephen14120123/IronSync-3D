package com.ironsync.service.impl;

import com.ironsync.common.exception.BusinessException;
import com.ironsync.dto.request.DietMoodCreateDTO;
import com.ironsync.dto.request.DietMoodUpdateDTO;
import com.ironsync.dto.response.DietMoodVO;
import com.ironsync.entity.DietMood;
import com.ironsync.mapper.DietMoodMapper;
import com.ironsync.service.DietMoodService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DietMoodServiceImpl implements DietMoodService {

    private final DietMoodMapper dietMoodMapper;

    public DietMoodServiceImpl(DietMoodMapper dietMoodMapper) {
        this.dietMoodMapper = dietMoodMapper;
    }

    @Override
    @Transactional
    public DietMoodVO create(DietMoodCreateDTO dto) {
        DietMood entity = new DietMood();
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(1L);
        dietMoodMapper.insert(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public DietMoodVO update(DietMoodUpdateDTO dto) {
        DietMood entity = dietMoodMapper.selectById(dto.getId());
        if (entity == null) {
            throw new BusinessException("饮食情绪记录不存在");
        }
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(1L);
        dietMoodMapper.update(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        dietMoodMapper.deleteById(id);
    }

    @Override
    public DietMoodVO findById(Long id) {
        DietMood entity = dietMoodMapper.selectById(id);
        return entity != null ? toVO(entity) : null;
    }

    @Override
    public List<DietMoodVO> findByDateRange(LocalDate from, LocalDate to) {
        List<DietMood> list = dietMoodMapper.selectByDateRange(1L, from, to);
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    private DietMoodVO toVO(DietMood entity) {
        if (entity == null) return null;
        DietMoodVO vo = new DietMoodVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }
}
