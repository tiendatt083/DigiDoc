package com.example.digitaldocumentshop.service;

import com.example.digitaldocumentshop.entity.Voucher;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {
    List<Voucher> getAllVouchers();
    Voucher getVoucherById(Long id);
    Voucher createVoucher(Voucher voucher);
    Voucher updateVoucher(Long id, Voucher voucher);
    void deleteVoucher(Long id);
    Voucher applyVoucher(String code, BigDecimal orderAmount);
}
