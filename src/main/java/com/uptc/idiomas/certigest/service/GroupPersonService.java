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

@Service
public class GroupPersonService extends BasicServiceImpl<GroupPersonDTO, GroupPerson, GroupPersonId> {

    @Autowired
    private GroupPersonRepo groupPersonRepo;

    @Override
    protected JpaRepository<GroupPerson, GroupPersonId> getRepo() {
        return groupPersonRepo;
    }

    private final GroupPersonMapper mapper = GroupPersonMapper.INSTANCE;

    @Override
    protected GroupPerson toEntity(GroupPersonDTO dto) {
        return mapper.mapGroupPersonDTOToGroupPerson(dto);
    }

    @Override
    protected GroupPersonDTO toDTO(GroupPerson entity) {
        return mapper.mapGroupPersonToGroupPersonDTO(entity);
    }

    @Transactional
    public void deleteAllByGroupId(Integer groupId) {
        groupPersonRepo.deleteByGroupId(groupId);
    }
}
