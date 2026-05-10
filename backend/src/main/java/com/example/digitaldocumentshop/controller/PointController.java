package com.example.digitaldocumentshop.controller;

import com.example.digitaldocumentshop.entity.PointHistory;
import com.example.digitaldocumentshop.service.PointService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/points")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class PointController {

    private final PointService pointService;

    public PointController(PointService pointService) {
        this.pointService = pointService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyPoints(Authentication authentication) {
        return ResponseEntity.ok(pointService.getMyPoints(authentication.getName()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<PointHistory>> getMyPointHistory(Authentication authentication) {
        return ResponseEntity.ok(pointService.getMyPointHistory(authentication.getName()));
    }
}
