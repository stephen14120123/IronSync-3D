package com.ironsync.service.impl;

import com.ironsync.common.exception.BusinessException;
import com.ironsync.common.exception.ErrorCode;
import com.ironsync.dto.request.SupplementCreateDTO;
import com.ironsync.dto.request.SupplementUpdateDTO;
import com.ironsync.dto.response.SupplementStatusVO;
import com.ironsync.dto.response.SupplementVO;
import com.ironsync.entity.Supplement;
import com.ironsync.mapper.SupplementMapper;
import com.ironsync.service.SupplementService;
import com.ironsync.service.supplement.StatusMachine;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplementServiceImpl implements SupplementService {

    private final SupplementMapper supplementMapper;
    private final StatusMachine statusMachine;

    public SupplementServiceImpl(SupplementMapper supplementMapper, StatusMachine statusMachine) {
        this.supplementMapper = supplementMapper;
        this.statusMachine = statusMachine;
    }

    @Override
    @Transactional
    public SupplementVO create(SupplementCreateDTO dto) {
        Supplement entity = new Supplement();
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(1L);
        entity.setCreatedAt(LocalDateTime.now());
        supplementMapper.insert(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public SupplementVO update(SupplementUpdateDTO dto) {
        Supplement entity = supplementMapper.selectById(dto.getId());
        if (entity == null) {
            throw new BusinessException(ErrorCode.SUPPLEMENT_NOT_FOUND);
        }
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(1L);
        supplementMapper.update(entity);
        return toVO(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        supplementMapper.deleteById(id);
    }

    @Override
    public SupplementVO findById(Long id) {
        Supplement entity = supplementMapper.selectById(id);
        return entity != null ? toVO(entity) : null;
    }

    @Override
    public List<SupplementVO> findAll() {
        return supplementMapper.selectAll().stream()
                .map(this::toVO)
                .sorted(Comparator.comparingInt(this::statusOrder))
                .collect(Collectors.toList());
    }

    @Override
    public List<SupplementStatusVO> getStatusList() {
        return supplementMapper.selectAll().stream()
                .map(this::toStatusVO)
                .sorted(Comparator.comparingInt(vo -> statusOrder(vo.getStatus())))
                .collect(Collectors.toList());
    }

    private SupplementVO toVO(Supplement entity) {
        if (entity == null) return null;
        SupplementVO vo = new SupplementVO();
        BeanUtils.copyProperties(entity, vo);
        vo.setStatus(statusMachine.calculate(entity.getCurrentStockG(), entity.getDailyConsumptionG()));
        return vo;
    }

    private SupplementStatusVO toStatusVO(Supplement entity) {
        if (entity == null) return null;
        SupplementStatusVO vo = new SupplementStatusVO();
        vo.setId(entity.getId());
        vo.setName(entity.getName());
        vo.setCurrentStockG(entity.getCurrentStockG());
        vo.setDailyConsumptionG(entity.getDailyConsumptionG());
        vo.setStatus(statusMachine.calculate(entity.getCurrentStockG(), entity.getDailyConsumptionG()));
        vo.setRemainingDays(statusMachine.calcRemainingDays(entity.getCurrentStockG(), entity.getDailyConsumptionG()));
        return vo;
    }

    private int statusOrder(SupplementVO vo) {
        return statusOrder(vo.getStatus());
    }

    private int statusOrder(String status) {
        switch (status) {
            case "告急": return 0;
            case "偏低": return 1;
            case "充足": return 2;
            default: return 3;
        }
    }
}
