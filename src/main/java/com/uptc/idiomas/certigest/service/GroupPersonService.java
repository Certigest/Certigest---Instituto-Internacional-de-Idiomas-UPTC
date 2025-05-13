package com.uptc.idiomas.certigest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uptc.idiomas.certigest.dto.GroupPersonDTO;
import com.uptc.idiomas.certigest.entity.GroupPerson;
import com.uptc.idiomas.certigest.entity.GroupPersonId;
import com.uptc.idiomas.certigest.mapper.GroupPersonMapper;
import com.uptc.idiomas.certigest.repo.GroupPersonRepo;

/**
 * Servicio para gestionar la relación entre grupos y personas.
 * Extiende la implementación básica de servicios para operaciones CRUD.
 */
@Service
public class GroupPersonService extends BasicServiceImpl<GroupPersonDTO, GroupPerson, GroupPersonId> {

    @Autowired
    private GroupPersonRepo groupPersonRepo;

    private final GroupPersonMapper mapper = GroupPersonMapper.INSTANCE;

    /**
     * Devuelve el repositorio asociado a la entidad GroupPerson.
     *
     * @return el repositorio JPA correspondiente.
     */
    @Override
    protected JpaRepository<GroupPerson, GroupPersonId> getRepo() {
        return groupPersonRepo;
    }

    /**
     * Convierte un DTO de GroupPerson a su entidad correspondiente.
     *
     * @param dto el objeto GroupPersonDTO.
     * @return la entidad GroupPerson.
     */
    @Override
    protected GroupPerson toEntity(GroupPersonDTO dto) {
        return mapper.mapGroupPersonDTOToGroupPerson(dto);
    }

    /**
     * Convierte una entidad GroupPerson a su DTO correspondiente.
     *
     * @param entity la entidad GroupPerson.
     * @return el objeto GroupPersonDTO.
     */
    @Override
    protected GroupPersonDTO toDTO(GroupPerson entity) {
        return mapper.mapGroupPersonToGroupPersonDTO(entity);
    }

    /**
     * Elimina todas las relaciones de personas asociadas a un grupo específico.
     *
     * @param groupId el ID del grupo.
     */
    @Transactional
    public void deleteAllByGroupId(Integer groupId) {
        groupPersonRepo.deleteByGroupId(groupId);
    }
}
