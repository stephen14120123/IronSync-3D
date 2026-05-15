package com.ironsync.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.ironsync.common.constant.ActionEnum;
import com.ironsync.common.exception.ErrorCode;
import com.ironsync.common.exception.BusinessException;
import com.ironsync.dto.request.TrainingRecordCreateDTO;
import com.ironsync.dto.request.TrainingRecordUpdateDTO;
import com.ironsync.dto.response.TrainingRecordVO;
import com.ironsync.dto.response.WeeklyVolumeVO;
import com.ironsync.entity.TrainingRecord;
import com.ironsync.mapper.TrainingRecordMapper;
import com.ironsync.service.TrainingRecordService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
            throw new BusinessException(ErrorCode.TRAINING_RECORD_NOT_FOUND);
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

    @Override
    public PageInfo<TrainingRecordVO> findAll(int page, int size) {
        PageHelper.startPage(page, size);
        List<TrainingRecord> list = trainingRecordMapper.selectAll(1L);
        List<TrainingRecordVO> voList = list.stream().map(this::toVO).collect(Collectors.toList());

        PageInfo<TrainingRecordVO> pageInfo = new PageInfo<>(voList);
        // list is actually Page<TrainingRecord> at runtime — restore pagination metadata
        if (list instanceof Page<?> p) {
            pageInfo.setPageNum(p.getPageNum());
            pageInfo.setPageSize(p.getPageSize());
            pageInfo.setTotal(p.getTotal());
            pageInfo.setPages(p.getPages());
        }
        return pageInfo;
    }

    @Override
    public List<TrainingRecordVO> findAllForChart() {
        List<TrainingRecord> list = trainingRecordMapper.selectAll(1L);
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public BigDecimal calculateTodayCalories() {
        List<TrainingRecord> todayRecords = trainingRecordMapper.selectByRecordDate(LocalDate.now());
        if (todayRecords == null || todayRecords.isEmpty()) {
            return BigDecimal.ZERO;
        }
        // 简化经验公式：总热量 (kcal) = sum(重量kg * 组数 * 次数) * 0.1
        BigDecimal totalVolume = todayRecords.stream()
                .map(r -> r.getWeightKg().multiply(BigDecimal.valueOf(r.getSets()))
                        .multiply(BigDecimal.valueOf(r.getReps())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalVolume.multiply(BigDecimal.valueOf(0.1)).setScale(0, java.math.RoundingMode.HALF_UP);
    }

    @Override
    public List<WeeklyVolumeVO> getWeeklyVolume() {
        LocalDate now = LocalDate.now();
        // 最近 4 周，从当前周周一开始
        List<TrainingRecord> allRecords = trainingRecordMapper.selectAll(1L);
        if (allRecords == null || allRecords.isEmpty()) return Collections.emptyList();

        Map<String, BigDecimal> weekMap = new LinkedHashMap<>();
        for (int i = 3; i >= 0; i--) {
            LocalDate weekStart = now.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            weekMap.put(weekStart.toString(), BigDecimal.ZERO);
        }

        for (TrainingRecord r : allRecords) {
            LocalDate weekStart = r.getRecordDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            String key = weekStart.toString();
            if (weekMap.containsKey(key)) {
                BigDecimal volume = r.getWeightKg()
                        .multiply(BigDecimal.valueOf(r.getSets()))
                        .multiply(BigDecimal.valueOf(r.getReps()));
                weekMap.merge(key, volume, BigDecimal::add);
            }
        }

        List<WeeklyVolumeVO> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : weekMap.entrySet()) {
            result.add(WeeklyVolumeVO.builder()
                    .weekStart(entry.getKey())
                    .volume(entry.getValue())
                    .build());
        }
        return result;
    }

    private TrainingRecordVO toVO(TrainingRecord entity) {
        if (entity == null) return null;
        TrainingRecordVO vo = new TrainingRecordVO();
        BeanUtils.copyProperties(entity, vo);
        vo.setActionName(entity.getActionName().getDisplayName());
        return vo;
    }
}
