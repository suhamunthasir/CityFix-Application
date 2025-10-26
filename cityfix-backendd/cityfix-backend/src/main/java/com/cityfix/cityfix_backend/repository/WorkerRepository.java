package com.cityfix.cityfix_backend.repository;

import com.cityfix.cityfix_backend.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByDepartment(String department);
    List<Worker> findByCity(String city);
}
