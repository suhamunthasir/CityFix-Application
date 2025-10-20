package com.cityfix.cityfix_backend.controller;



import com.cityfix.cityfix_backend.entity.Department;

import com.cityfix.cityfix_backend.service.DepartmentService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {


    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }


    @GetMapping
    public List<Department> getAllDepartments() {
        return service.getAllDepartments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartment(@PathVariable Long id) {
        return service.getDepartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/logos/{filename:.+}")
    public ResponseEntity<Resource> getLogo(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get("uploads/department").resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .header("Content-Type", Files.probeContentType(filePath))
                .body(resource);
    }

    @PostMapping("/save")
    public ResponseEntity<Department> createDepartment(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam(required = false) String email,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile
    ) throws IOException {

        System.out.println("✅ Received department: " + name + " | " + description + " | " + email);
        Department department = new Department();
        department.setName(name);
        department.setDescription(description);
        department.setEmail(email);

        Department saved = service.saveDepartment(department, logoFile);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam(required = false) String email,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile
    ) throws IOException {
        return service.getDepartmentById(id)
                .map(existing -> {
                    existing.setName(name);
                    existing.setDescription(description);
                    existing.setEmail(email);
                    try {
                        service.saveDepartment(existing, logoFile);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    return ResponseEntity.ok(existing);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        service.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
