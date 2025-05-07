package com.uptc.idiomas.certigest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.uptc.idiomas.certigest.dto.LoginDTO;
import com.uptc.idiomas.certigest.entity.Login;

@Mapper
public interface LoginMapper {
    
    LoginMapper INSTANCE = Mappers.getMapper(LoginMapper.class);

    Login mapLoginDTOToLogin(LoginDTO loginDTO);

    LoginDTO mapLoginToLoginDTO(Login login);
}
