package com.cityfix.cityfix_backend.service;

import com.cityfix.cityfix_backend.entity.CityAdmin;
import com.cityfix.cityfix_backend.repository.CityAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CityAdminService {

    @Autowired
    private CityAdminRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public CityAdmin addCityAdmin(CityAdmin admin) {
        // always hash password
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        // first login is always true
        admin.setFirstLogin(true);

        // default role
        admin.setRole("CITY_ADMIN");

        return repository.save(admin);
    }

    public List<CityAdmin> getAllAdmins() {
        return repository.findAll();
    }

    public Optional<CityAdmin> getAdminById(Long id) {
        return repository.findById(id);
    }

    public CityAdmin updateCityAdmin(Long id, CityAdmin adminDetails) {
        CityAdmin admin = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        admin.setFullName(adminDetails.getFullName());
        admin.setNic(adminDetails.getNic());
        admin.setEmail(adminDetails.getEmail());
        admin.setPhoneNumber(adminDetails.getPhoneNumber());
        admin.setAddress(adminDetails.getAddress());
        admin.setDob(adminDetails.getDob());
        admin.setCityAssigned(adminDetails.getCityAssigned());

        return repository.save(admin);
    }

    public void deleteCityAdmin(Long id) {
        repository.deleteById(id);
    }

    public void changePassword(Long id, String newPassword) {
        CityAdmin admin = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setFirstLogin(false);
        repository.save(admin);
    }
}
