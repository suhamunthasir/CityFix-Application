package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.entity.CityAdmin;
import com.cityfix.cityfix_backend.service.CityAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/city-admins")
public class CityAdminController {

    @Autowired
    private CityAdminService service;

    @PostMapping("/add")
    public ResponseEntity<CityAdmin> addAdmin(@RequestBody CityAdmin admin) {
        return ResponseEntity.ok(service.addCityAdmin(admin));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CityAdmin>> getAllAdmins() {
        return ResponseEntity.ok(service.getAllAdmins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CityAdmin> getAdmin(@PathVariable Long id) {
        return service.getAdminById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CityAdmin> updateAdmin(@PathVariable Long id, @RequestBody CityAdmin admin) {
        return ResponseEntity.ok(service.updateCityAdmin(id, admin));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        service.deleteCityAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody String newPassword) {
        service.changePassword(id, newPassword);
        return ResponseEntity.ok().build();
    }
}
