package com.uptc.idiomas.certigest.dto;

import lombok.*;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonEnrollInfo {

    private String fullName;         
    private String documentNumber;   
    private String course;           
    private String level;            
    private Float grade;
    private Integer levelCost;         
    private Integer materialCost;
    private Date startDate;
    private Date endDate;
    private String description;
}
