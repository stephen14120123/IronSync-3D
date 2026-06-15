package com.ironsync.service.impl;

import com.ironsync.common.auth.CurrentUser;

import com.ironsync.common.exception.BusinessException;
import com.ironsync.common.exception.ErrorCode;
import com.ironsync.dto.request.BodyMetricsCreateDTO;
import com.ironsync.dto.request.BodyMetricsUpdateDTO;
import com.ironsync.dto.response.BodyMetricsVO;
import com.ironsync.entity.BodyMetrics;
import com.ironsync.mapper.BodyMetricsMapper;
import com.ironsync.service.BodyMetricsService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BodyMetricsServiceImpl implements BodyMetricsService {

    private final BodyMetricsMapper bodyMetricsMapper;

    public BodyMetricsServiceImpl(BodyMetricsMapper bodyMetricsMapper) {
        this.bodyMetricsMapper = bodyMetricsMapper;
    }

    @Override
    @Transactional
    public BodyMetricsVO create(BodyMetricsCreateDTO dto) {
        BodyMetrics entity = new BodyMetrics();
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(CurrentUser.getUserId());
        bodyMetricsMapper.insert(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public BodyMetricsVO update(BodyMetricsUpdateDTO dto) {
        BodyMetrics entity = bodyMetricsMapper.selectById(dto.getId());
        if (entity == null) {
            throw new BusinessException(ErrorCode.BODY_METRICS_NOT_FOUND);
        }
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(CurrentUser.getUserId());
        bodyMetricsMapper.update(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        bodyMetricsMapper.deleteById(id);
    }

    @Override
    public BodyMetricsVO findById(Long id) {
        BodyMetrics entity = bodyMetricsMapper.selectById(id);
        return entity != null ? toVO(entity) : null;
    }

    @Override
    public List<BodyMetricsVO> findByDateRange(LocalDate from, LocalDate to) {
        List<BodyMetrics> list = bodyMetricsMapper.selectByDateRange(CurrentUser.getUserId(), from, to);
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    private BodyMetricsVO toVO(BodyMetrics entity) {
        if (entity == null) return null;
        BodyMetricsVO vo = new BodyMetricsVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }
}
