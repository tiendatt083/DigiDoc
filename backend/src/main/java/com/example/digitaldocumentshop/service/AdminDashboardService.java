package com.example.digitaldocumentshop.service;

import java.util.Map;

public interface AdminDashboardService {
    Map<String, Object> getDashboardSummary();
    Map<String, Object> getRevenueChart();
}
