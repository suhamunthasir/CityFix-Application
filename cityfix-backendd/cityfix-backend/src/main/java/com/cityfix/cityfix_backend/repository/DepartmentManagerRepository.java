package com.cityfix.cityfix_backend.repository;

import com.cityfix.cityfix_backend.entity.DepartmentManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentManagerRepository extends JpaRepository<DepartmentManager, Long> {
    Optional<DepartmentManager> findByEmail(String email);
}
