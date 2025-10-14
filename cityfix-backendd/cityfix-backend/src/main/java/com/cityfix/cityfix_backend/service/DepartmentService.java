package com.cityfix.cityfix_backend.service;



import com.cityfix.cityfix_backend.entity.Department;
import com.cityfix.cityfix_backend.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    public List<Department> getAllDepartments() {
        return repository.findAll();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return repository.findById(id);
    }

    public Department saveDepartment(Department department, MultipartFile logoFile) throws IOException {
        if (logoFile != null && !logoFile.isEmpty()) {
            String filename = System.currentTimeMillis() + "_" + logoFile.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/department");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            logoFile.transferTo(uploadPath.resolve(filename));
            department.setLogo(filename);
        }
        return repository.save(department);
    }

    public void deleteDepartment(Long id) {
        repository.deleteById(id);
    }
}
