package com.uptc.idiomas.certigest.service;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public abstract class BasicServiceImpl<T, ID> implements BasicService<T, ID> {

    protected abstract JpaRepository<T, ID> getRepo();

    @Override
    public T create(T dto) {
        return getRepo().save(dto);
    }

    @Override
    public T update(T dto) {
        return getRepo().save(dto);
    }

    @Override
    public T findById(ID id) {
        return getRepo().findById(id).orElse(null);
    }

    @Override
    public List<T> findAll() {
        return getRepo().findAll();
    }

    @Override
    public void deleteById(ID id) {
        getRepo().deleteById(id);
    }
}