package com.cityfix.cityfix_backend.dto;

public class LoginResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String cityAssigned; // NEW

    // Constructor
    public LoginResponse(Long id, String fullName, String email, String role, String cityAssigned) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.cityAssigned = cityAssigned;
    }

    // Default constructor
    public LoginResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCityAssigned() { return cityAssigned; }
    public void setCityAssigned(String cityAssigned) { this.cityAssigned = cityAssigned; }
}
