package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.entity.DepartmentManager;
import com.cityfix.cityfix_backend.service.DepartmentManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/department-managers")
@CrossOrigin(origins = "*")
public class DepartmentManagerController {

    @Autowired
    private DepartmentManagerService service;

    @PostMapping
    public ResponseEntity<DepartmentManager> createManager(@RequestBody DepartmentManager manager) {
        return ResponseEntity.ok(service.saveManager(manager));
    }

    @GetMapping
    public ResponseEntity<List<DepartmentManager>> getAllManagers() {
        return ResponseEntity.ok(service.getAllManagers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentManager> getManagerById(@PathVariable Long id) {
        return service.getManagerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentManager> updateManager(@PathVariable Long id, @RequestBody DepartmentManager manager) {
        return service.getManagerById(id).map(existing -> {
            manager.setId(existing.getId());
            return ResponseEntity.ok(service.saveManager(manager));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        service.deleteManager(id);
        return ResponseEntity.noContent().build();
    }
}
