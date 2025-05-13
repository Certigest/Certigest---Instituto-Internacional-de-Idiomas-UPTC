package com.uptc.idiomas.certigest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Implementación base genérica para servicios que manejan operaciones CRUD.
 * Proporciona una lógica común para los servicios que trabajan con DTOs y entidades JPA.
 *
 * @param <DTO>   Tipo del objeto de transferencia de datos.
 * @param <ENTITY> Tipo de la entidad JPA.
 * @param <ID>    Tipo del identificador de la entidad.
 */
public abstract class BasicServiceImpl<DTO, ENTITY, ID> implements BasicService<DTO, ENTITY, ID> {

    /**
     * Obtiene el repositorio JPA correspondiente a la entidad.
     *
     * @return JpaRepository correspondiente.
     */
    protected abstract JpaRepository<ENTITY, ID> getRepo();

    /**
     * Convierte un DTO a una entidad.
     *
     * @param dto Objeto DTO a convertir.
     * @return Entidad correspondiente.
     */
    protected abstract ENTITY toEntity(DTO dto);

    /**
     * Convierte una entidad a un DTO.
     *
     * @param entity Entidad a convertir.
     * @return DTO correspondiente.
     */
    protected abstract DTO toDTO(ENTITY entity);

    /**
     * Crea una nueva entidad a partir de un DTO.
     *
     * @param dto DTO con la información a persistir.
     * @return DTO del objeto creado.
     */
    @Override
    public DTO create(DTO dto) {
        ENTITY entity = toEntity(dto);
        ENTITY saved = getRepo().save(entity);
        return toDTO(saved);
    }

    /**
     * Actualiza una entidad existente con los datos del DTO.
     *
     * @param dto DTO con los datos actualizados.
     * @return DTO del objeto actualizado.
     */
    @Override
    public DTO update(DTO dto) {
        ENTITY entity = toEntity(dto);
        ENTITY updated = getRepo().save(entity);
        return toDTO(updated);
    }

    /**
     * Busca una entidad por su identificador.
     *
     * @param id Identificador de la entidad.
     * @return DTO correspondiente, o {@code null} si no se encuentra.
     */
    @Override
    public DTO findById(ID id) {
        return getRepo().findById(id).map(this::toDTO).orElse(null);
    }

    /**
     * Obtiene todos los registros como una lista de DTOs.
     *
     * @return Lista de DTOs.
     */
    @Override
    public List<DTO> findAll() {
        return getRepo().findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Elimina una entidad por su identificador.
     *
     * @param id Identificador del objeto a eliminar.
     */
    @Override
    public void deleteById(ID id) {
        getRepo().deleteById(id);
    }
}
