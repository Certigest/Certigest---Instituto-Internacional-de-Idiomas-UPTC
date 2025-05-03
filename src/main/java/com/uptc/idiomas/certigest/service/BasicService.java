package com.uptc.idiomas.certigest.service;

import java.util.List;

public interface BasicService<T, ID> {

    public T create(T dto);

    public T update(T dto);

    public T findById(ID id);

    public List<T> findAll();

    public void deleteById(ID id);
}
