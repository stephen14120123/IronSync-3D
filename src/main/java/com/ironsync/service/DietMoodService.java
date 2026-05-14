package com.ironsync.service;

import com.ironsync.dto.request.DietMoodCreateDTO;
import com.ironsync.dto.request.DietMoodUpdateDTO;
import com.ironsync.dto.response.DietMoodVO;

import java.time.LocalDate;
import java.util.List;

public interface DietMoodService {

    DietMoodVO create(DietMoodCreateDTO dto);

    DietMoodVO update(DietMoodUpdateDTO dto);

    void deleteById(Long id);

    DietMoodVO findById(Long id);

    List<DietMoodVO> findByDateRange(LocalDate from, LocalDate to);
}
