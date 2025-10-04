package com.cityfix.cityfix_backend.service;

import com.cityfix.cityfix_backend.entity.Citizen;
import com.cityfix.cityfix_backend.repository.CitizenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CitizenService {

    @Autowired
    private CitizenRepository repository;

    public boolean emailExists(String email) {
        return repository.existsByEmail(email);
    }

    public boolean nicExists(String nic) {
        return repository.existsByNic(nic);
    }

    public Citizen saveCitizen(Citizen citizen) {
        return repository.save(citizen);
    }

    public List<Citizen> getAllCitizens() {
        return repository.findAll();
    }

    public Citizen getCitizenById(Long id) {
        Optional<Citizen> opt = repository.findById(id);
        return opt.orElse(null);
    }

    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    public void updateCitizen(Long id, Citizen citizen) {
        Citizen existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Citizen not found"));

        existing.setFirstName(citizen.getFirstName());
        existing.setLastName(citizen.getLastName());
        existing.setEmail(citizen.getEmail());
        existing.setPhone(citizen.getPhone());
        existing.setNic(citizen.getNic());
        existing.setDob(citizen.getDob());
        existing.setPassword(citizen.getPassword());
        existing.setAddress(citizen.getAddress());

        // Optional profile picture
        if (citizen.getProfilePicture() != null) {
            existing.setProfilePicture(citizen.getProfilePicture());
        }

        repository.save(existing);
    }


    public void deleteCitizen(Long id) {
        repository.deleteById(id);
    }
    public Citizen findByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }

}
