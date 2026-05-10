package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.entity.PointHistory;
import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.repository.PointHistoryRepository;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.service.PointService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PointServiceImpl implements PointService {

    private final PointHistoryRepository pointHistoryRepository;
    private final UserRepository userRepository;

    public PointServiceImpl(PointHistoryRepository pointHistoryRepository, UserRepository userRepository) {
        this.pointHistoryRepository = pointHistoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Map<String, Object> getMyPoints(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("rewardPoints", user.getRewardPoints());
        return response;
    }

    @Override
    public List<PointHistory> getMyPointHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return pointHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
}
