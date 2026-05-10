package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.entity.Voucher;
import com.example.digitaldocumentshop.enums.VoucherStatus;
import com.example.digitaldocumentshop.repository.VoucherRepository;
import com.example.digitaldocumentshop.service.VoucherService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Override
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @Override
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
    }

    @Override
    public Voucher createVoucher(Voucher voucher) {
        voucher.setUsedCount(0);
        if (voucher.getStatus() == null) voucher.setStatus(VoucherStatus.ACTIVE);
        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher updateVoucher(Long id, Voucher voucher) {
        Voucher existing = getVoucherById(id);
        existing.setName(voucher.getName());
        existing.setCode(voucher.getCode());
        existing.setDiscountType(voucher.getDiscountType());
        existing.setDiscountValue(voucher.getDiscountValue());
        existing.setMinOrderAmount(voucher.getMinOrderAmount());
        existing.setMaxDiscountAmount(voucher.getMaxDiscountAmount());
        existing.setUsageLimit(voucher.getUsageLimit());
        existing.setStartDate(voucher.getStartDate());
        existing.setEndDate(voucher.getEndDate());
        existing.setStatus(voucher.getStatus());
        return voucherRepository.save(existing);
    }

    @Override
    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
    }

    @Override
    public Voucher applyVoucher(String code, java.math.BigDecimal orderAmount) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại."));
                
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new RuntimeException("Mã giảm giá không còn hoạt động.");
        }
        if (voucher.getEndDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn.");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng.");
        }
        if (voucher.getMinOrderAmount() != null && orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new RuntimeException("Đơn hàng tối thiểu " +
                String.format("%,.0f", voucher.getMinOrderAmount()) + "đ mới dùng được mã này.");
        }
        
        return voucher;
    }
}
