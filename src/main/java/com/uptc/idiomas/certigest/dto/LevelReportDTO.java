package com.uptc.idiomas.certigest.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LevelReportDTO {

    private Integer level_id;
    private String level_name;
    private String level_description;
    private Integer level_cost;
    private Integer material_cost;
    private Integer studentsActive;
    private Long totalEarnings;
}
