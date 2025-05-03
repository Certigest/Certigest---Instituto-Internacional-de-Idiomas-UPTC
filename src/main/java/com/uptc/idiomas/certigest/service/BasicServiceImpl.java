package com.uptc.idiomas.certigest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;

public abstract class BasicServiceImpl<DTO, ENTITY, ID> implements BasicService<DTO, ENTITY, ID> {

    protected abstract JpaRepository<ENTITY, ID> getRepo();

    protected abstract ENTITY toEntity(DTO dto);

    protected abstract DTO toDTO(ENTITY entity);

    @Override
    public DTO create(DTO dto) {
        ENTITY entity = toEntity(dto);
        ENTITY saved = getRepo().save(entity);
        return toDTO(saved);
    }

    @Override
    public DTO update(DTO dto) {
        ENTITY entity = toEntity(dto);
        ENTITY updated = getRepo().save(entity);
        return toDTO(updated);
    }

    @Override
    public DTO findById(ID id) {
        return getRepo().findById(id).map(this::toDTO).orElse(null);
    }

    @Override
    public List<DTO> findAll() {
        return getRepo().findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public void deleteById(ID id) {
        getRepo().deleteById(id);
    }
}
