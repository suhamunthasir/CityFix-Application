package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.dto.LoginResponse;
import com.cityfix.cityfix_backend.entity.CityAdmin;
import com.cityfix.cityfix_backend.repository.CityAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/cityadmin")
public class cityAdminAuthController {

    @Autowired
    private CityAdminRepository cityAdminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        CityAdmin admin = cityAdminRepo.findByEmail(email).orElse(null);

        if(admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            LoginResponse resp = new LoginResponse(
                    admin.getId(),
                    admin.getFullName(),
                    admin.getEmail(),
                    "CITY_ADMIN",
                    admin.getCityAssigned() // NEW
            );
            return ResponseEntity.ok(resp);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("INVALID_CREDENTIALS");
    }

}
