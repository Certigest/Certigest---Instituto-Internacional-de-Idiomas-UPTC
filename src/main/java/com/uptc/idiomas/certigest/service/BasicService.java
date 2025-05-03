package com.uptc.idiomas.certigest.service;

import java.util.List;

public interface BasicService<DTO, ENTITY, ID> {
    DTO create(DTO dto);

    DTO update(DTO dto);

    DTO findById(ID id);

    List<DTO> findAll();

    void deleteById(ID id);
}
