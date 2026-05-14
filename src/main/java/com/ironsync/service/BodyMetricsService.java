package com.ironsync.service;

import com.ironsync.dto.request.BodyMetricsCreateDTO;
import com.ironsync.dto.request.BodyMetricsUpdateDTO;
import com.ironsync.dto.response.BodyMetricsVO;

import java.time.LocalDate;
import java.util.List;

public interface BodyMetricsService {

    BodyMetricsVO create(BodyMetricsCreateDTO dto);

    BodyMetricsVO update(BodyMetricsUpdateDTO dto);

    void deleteById(Long id);

    BodyMetricsVO findById(Long id);

    List<BodyMetricsVO> findByDateRange(LocalDate from, LocalDate to);
}
