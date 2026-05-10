package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.entity.PointHistory;

import java.util.List;
import java.util.Map;

public interface PointService {
    Map<String, Object> getMyPoints(String email);
    List<PointHistory> getMyPointHistory(String email);
}
