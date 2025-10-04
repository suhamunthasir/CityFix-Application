package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.entity.Citizen;
import com.cityfix.cityfix_backend.service.CitizenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citizens")
@CrossOrigin(origins = "*")
public class CitizenController {

    @Autowired
    private CitizenService service;

    // CREATE - Signup with profile picture
    @PostMapping("/signup")
    public Map<String, String> registerCitizen(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("nic") String nic,
            @RequestParam("dob") String dob, // format: yyyy-MM-dd
            @RequestParam("password") String password,
            @RequestParam("address") String address,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {

        Map<String, String> response = new HashMap<>();

        if (service.emailExists(email)) {
            response.put("status", "error");
            response.put("message", "Email already registered");
            return response;
        }

        if (service.nicExists(nic)) {
            response.put("status", "error");
            response.put("message", "NIC already registered");
            return response;
        }

        Citizen citizen = new Citizen();
        citizen.setFirstName(firstName);
        citizen.setLastName(lastName);
        citizen.setEmail(email);
        citizen.setPhone(phone);
        citizen.setNic(nic);
        citizen.setDob(LocalDate.parse(dob));
        citizen.setPassword(password);
        citizen.setAddress(address);

        // Handle profile picture - save to folder
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String filename = System.currentTimeMillis() + "_" + profilePicture.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/citizens");
            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                profilePicture.transferTo(uploadPath.resolve(filename));
                citizen.setProfilePicture(filename);
            } catch (IOException e) {
                response.put("status", "error");
                response.put("message", "Failed to upload profile picture");
                return response;
            }
        }

        service.saveCitizen(citizen);
        response.put("status", "success");
        response.put("message", "Citizen registered successfully!");
        return response;
    }

    // READ - Get all citizens
    @GetMapping("/")
    public List<Citizen> getAllCitizens() {
        return service.getAllCitizens();
    }

    // READ - Get citizen by ID
    @GetMapping("/{id}")
    public Citizen getCitizenById(@PathVariable Long id) {
        return service.getCitizenById(id);
    }

    // UPDATE - Update citizen info
    @PutMapping("/{id}")
    public Map<String, String> updateCitizen(
            @PathVariable Long id,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("nic") String nic,
            @RequestParam("dob") String dob,
            @RequestParam("password") String password,
            @RequestParam("address") String address,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {

        Map<String, String> response = new HashMap<>();

        if (!service.existsById(id)) {
            response.put("status", "error");
            response.put("message", "Citizen not found");
            return response;
        }

        Citizen citizen = service.getCitizenById(id);
        citizen.setFirstName(firstName);
        citizen.setLastName(lastName);
        citizen.setEmail(email);
        citizen.setPhone(phone);
        citizen.setNic(nic);
        citizen.setDob(LocalDate.parse(dob));
        citizen.setPassword(password);
        citizen.setAddress(address);

        // Update profile picture if uploaded
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String filename = System.currentTimeMillis() + "_" + profilePicture.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/citizens");
            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                profilePicture.transferTo(uploadPath.resolve(filename));
                citizen.setProfilePicture(filename);
            } catch (IOException e) {
                response.put("status", "error");
                response.put("message", "Failed to upload profile picture");
                return response;
            }
        }

        service.updateCitizen(id, citizen);
        response.put("status", "success");
        response.put("message", "Citizen updated successfully!");
        return response;
    }

    // DELETE - Delete citizen
    @DeleteMapping("/{id}")
    public Map<String, String> deleteCitizen(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();

        if (!service.existsById(id)) {
            response.put("status", "error");
            response.put("message", "Citizen not found");
            return response;
        }

        service.deleteCitizen(id);
        response.put("status", "success");
        response.put("message", "Citizen deleted successfully!");
        return response;
    }

    @PostMapping("/login")
    public Map<String, Object> loginCitizen(
            @RequestParam("email") String email,
            @RequestParam("password") String password) {

        Map<String, Object> response = new HashMap<>();

        // ✅ Correct method name (matches CitizenService)
        Citizen citizen = service.findByEmail(email);

        if (citizen == null) {
            response.put("status", "error");
            response.put("message", "No account found with this email.");
            return response;
        }

        if (!citizen.getPassword().equals(password)) {
            response.put("status", "error");
            response.put("message", "Invalid password.");
            return response;
        }

        // ✅ Successful login
        response.put("status", "success");
        response.put("message", "Login successful!");
        response.put("citizenId", citizen.getId());
        response.put("firstName", citizen.getFirstName());
        response.put("lastName", citizen.getLastName());
        response.put("email", citizen.getEmail());
        response.put("profilePicture", citizen.getProfilePicture());

        return response;
    }


}
