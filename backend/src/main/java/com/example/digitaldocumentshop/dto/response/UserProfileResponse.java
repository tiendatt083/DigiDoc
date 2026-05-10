package com.example.digitaldocumentshop.dto.response;

import lombok.Data;

@Data
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Integer rewardPoints;
    private String role;
}
