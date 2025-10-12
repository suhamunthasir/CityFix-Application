package com.cityfix.cityfix_backend.repository;

import com.cityfix.cityfix_backend.entity.CityAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CityAdminRepository extends JpaRepository<CityAdmin, Long> {
    Optional<CityAdmin> findByEmail(String email);
    Optional<CityAdmin> findByNic(String nic);
}
