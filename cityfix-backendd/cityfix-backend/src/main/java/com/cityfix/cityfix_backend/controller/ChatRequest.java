package com.cityfix.cityfix_backend.controller;

public class ChatRequest {
    private String message;
    private Long citizenId;

    public ChatRequest() {}

    public ChatRequest(String message, Long citizenId) {
        this.message = message;
        this.citizenId = citizenId;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
}
