package com.uptc.idiomas.certigest.service;

import java.util.List;

/**
 * Interfaz genérica para servicios básicos CRUD (Crear, Leer, Actualizar, Eliminar).
 *
 * @param <DTO>   Tipo del objeto Data Transfer Object (DTO).
 * @param <ENTITY> Tipo de la entidad correspondiente.
 * @param <ID>    Tipo del identificador único de la entidad (por ejemplo, Long, Integer, String).
 */
public interface BasicService<DTO, ENTITY, ID> {

    /**
     * Crea una nueva entidad a partir de un DTO.
     *
     * @param dto Objeto DTO a crear.
     * @return DTO creado.
     */
    DTO create(DTO dto);

    /**
     * Actualiza una entidad existente a partir de un DTO.
     *
     * @param dto Objeto DTO con la información actualizada.
     * @return DTO actualizado.
     */
    DTO update(DTO dto);

    /**
     * Busca una entidad por su identificador.
     *
     * @param id Identificador único.
     * @return DTO correspondiente a la entidad encontrada.
     */
    DTO findById(ID id);

    /**
     * Retorna todas las entidades como una lista de DTOs.
     *
     * @return Lista de DTOs.
     */
    List<DTO> findAll();

    /**
     * Elimina una entidad por su identificador.
     *
     * @param id Identificador único de la entidad a eliminar.
     */
    void deleteById(ID id);
}
