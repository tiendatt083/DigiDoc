package com.example.digitaldocumentshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "points_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String type; // e.g. "EARN", "REDEEM"
}
