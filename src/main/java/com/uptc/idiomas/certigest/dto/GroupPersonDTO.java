package com.uptc.idiomas.certigest.dto;

import lombok.*;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupPersonDTO {
    private PersonDTO person_id;
    private GroupInstDTO group_id;
    private Float calification;
    private Date calificationDate;
    private Date start_date;
    private Date end_date;
    private Integer level_cost;
    private Integer material_cost;
    private String level_modality;
    private String level_duration;
}
