package com.cityfix.cityfix_backend.service;

import com.cityfix.cityfix_backend.entity.DepartmentManager;
import com.cityfix.cityfix_backend.repository.DepartmentManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentManagerService {

    @Autowired
    private DepartmentManagerRepository repository;

    public DepartmentManager saveManager(DepartmentManager manager) {
        return repository.save(manager);
    }

    public List<DepartmentManager> getAllManagers() {
        return repository.findAll();
    }

    public Optional<DepartmentManager> getManagerById(Long id) {
        return repository.findById(id);
    }

    public void deleteManager(Long id) {
        repository.deleteById(id);
    }

    public Optional<DepartmentManager> getManagerByEmail(String email) {
        return repository.findByEmail(email);
    }
}
