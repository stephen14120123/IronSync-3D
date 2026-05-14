package com.ironsync.service;

import com.ironsync.dto.request.SupplementCreateDTO;
import com.ironsync.dto.request.SupplementUpdateDTO;
import com.ironsync.dto.response.SupplementVO;

import java.util.List;

public interface SupplementService {

    SupplementVO create(SupplementCreateDTO dto);

    SupplementVO update(SupplementUpdateDTO dto);

    void deleteById(Long id);

    SupplementVO findById(Long id);

    List<SupplementVO> findAll();
}
