package com.cityfix.cityfix_backend.repository;

import com.cityfix.cityfix_backend.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {
    boolean existsByEmail(String email);
    boolean existsByNic(String nic);
    Optional<Citizen> findByEmail(String email);

}
