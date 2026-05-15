package com.ironsync.service.impl;

import com.ironsync.common.exception.BusinessException;
import com.ironsync.common.exception.ErrorCode;
import com.ironsync.dto.request.SupplementCreateDTO;
import com.ironsync.dto.request.SupplementUpdateDTO;
import com.ironsync.dto.response.SupplementVO;
import com.ironsync.entity.Supplement;
import com.ironsync.mapper.SupplementMapper;
import com.ironsync.service.SupplementService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplementServiceImpl implements SupplementService {

    private final SupplementMapper supplementMapper;

    public SupplementServiceImpl(SupplementMapper supplementMapper) {
        this.supplementMapper = supplementMapper;
    }

    @Override
    @Transactional
    public SupplementVO create(SupplementCreateDTO dto) {
        Supplement entity = new Supplement();
        BeanUtils.copyProperties(dto, entity);
        entity.setUserId(1L);
        entity.setStatus(calculateStatus(entity.getCurrentStockG(), entity.getDailyConsumptionG()));
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
        entity.setStatus(calculateStatus(entity.getCurrentStockG(), entity.getDailyConsumptionG()));
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
                .collect(Collectors.toList());
    }

    /**
     * 补剂状态机：根据库存和每日消耗量计算预警状态。
     * 剩余天数 > 30 → 充足；7-30 → 偏低；< 7 → 告急
     */
    public static String calculateStatus(BigDecimal stock, BigDecimal daily) {
        if (stock == null || daily == null || daily.compareTo(BigDecimal.ZERO) == 0) {
            return "告急";
        }
        BigDecimal days = stock.divide(daily, 2, RoundingMode.HALF_UP);
        if (days.compareTo(new BigDecimal("30")) > 0) {
            return "充足";
        } else if (days.compareTo(new BigDecimal("7")) >= 0) {
            return "偏低";
        } else {
            return "告急";
        }
    }

    private SupplementVO toVO(Supplement entity) {
        if (entity == null) return null;
        SupplementVO vo = new SupplementVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }
}
