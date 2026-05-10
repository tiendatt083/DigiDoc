package com.example.digitaldocumentshop.repository;

import com.example.digitaldocumentshop.entity.Voucher;
import com.example.digitaldocumentshop.enums.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCodeAndStatus(String code, VoucherStatus status);
    Optional<Voucher> findByCode(String code);
}
