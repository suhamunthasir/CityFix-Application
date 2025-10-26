package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.entity.Citizen;
import com.cityfix.cityfix_backend.entity.Report;
import com.cityfix.cityfix_backend.service.CitizenService;
import com.cityfix.cityfix_backend.service.ReportService;

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


import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private CitizenService citizenService;


    @PostMapping("/submit")
    public Map<String, String> submitReport(
            @RequestParam("citizenId") Long citizenId,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "locationNotes", required = false) String locationNotes,
            @RequestParam("problemCategory") String problemCategory,
            @RequestParam("problemTitle") String problemTitle,
            @RequestParam("problemDescription") String problemDescription,
            @RequestParam(value = "photos", required = false) MultipartFile[] photos,
            @RequestParam(value = "publicizeIssue", required = false, defaultValue = "0") Integer publicizeIssue,
            @RequestParam(value = "showName", required = false, defaultValue = "0") Integer showName
    ) {

        Map<String, String> response = new HashMap<>();

        Citizen citizen = citizenService.getCitizenById(citizenId);
        if (citizen == null) {
            response.put("status", "error");
            response.put("message", "Citizen not found");
            return response;
        }

        Report report = new Report();
        report.setCitizen(citizen);
        report.setLatitude(latitude);
        report.setLongitude(longitude);
        report.setLocationNotes(locationNotes);
        report.setProblemCategory(problemCategory);
        report.setProblemTitle(problemTitle);
        report.setProblemDescription(problemDescription);
        report.setSubmittedDate(LocalDate.now());

        // Set new fields
        report.setPublicizeIssue(publicizeIssue);
        report.setShowName(showName);

        // Handle photos...
        if (photos != null && photos.length > 0) {
            StringBuilder photoNames = new StringBuilder();
            for (MultipartFile photo : photos) {
                System.out.println("Received photo: " + photo.getOriginalFilename()
                        + ", size: " + photo.getSize() + " bytes");
                String filename = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/reports");
                try {
                    if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
                    photo.transferTo(uploadPath.resolve(filename));
                    if (photoNames.length() > 0) photoNames.append(",");
                    photoNames.append(filename);
                } catch (IOException e) {
                    response.put("status", "error");
                    response.put("message", "Failed to upload photo");
                    return response;
                }
            }
            report.setPhotos(photoNames.toString());
        }

        reportService.saveReport(report);

        response.put("status", "success");
        response.put("message", "Report submitted successfully");
        return response;
    }

    // UPDATE report
    @PutMapping("/{id}")
    public Map<String, String> updateReport(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) String locationNotes,
            @RequestParam String problemCategory,
            @RequestParam String problemTitle,
            @RequestParam String problemDescription,
            @RequestParam(required = false) List<MultipartFile> photos,
            @RequestParam(value = "publicizeIssue", required = false) Integer publicizeIssue,
            @RequestParam(value = "showName", required = false) Integer showName,
            @RequestParam(value = "status", required = false) String status,  // existing
            @RequestParam(value = "severity", required = false) String severity // ✅ NEW
    ) {
        Map<String, String> response = new HashMap<>();
        Report existingReport = reportService.getReportById(id);
        if (existingReport == null) {
            response.put("status", "error");
            response.put("message", "Report not found");
            return response;
        }

        existingReport.setLatitude(latitude);
        existingReport.setLongitude(longitude);
        existingReport.setLocationNotes(locationNotes);
        existingReport.setProblemCategory(problemCategory);
        existingReport.setProblemTitle(problemTitle);
        existingReport.setProblemDescription(problemDescription);

        if (publicizeIssue != null) existingReport.setPublicizeIssue(publicizeIssue);
        if (showName != null) existingReport.setShowName(showName);
        if (status != null) existingReport.setStatus(status);
        if (severity != null) existingReport.setSeverity(severity); // ✅ NEW LINE

        // Photos handling remains the same...
        if (photos != null && !photos.isEmpty()) {
            StringBuilder filenames = new StringBuilder();
            if (existingReport.getPhotos() != null) {
                filenames.append(existingReport.getPhotos()).append(",");
            }
            Long citizenId = existingReport.getCitizen().getId();
            Long reportId = existingReport.getId();
            Path uploadPath = Paths.get("uploads/reports/" + citizenId + "/" + reportId);
            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                for (MultipartFile photo : photos) {
                    if (!photo.isEmpty()) {
                        String filename = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                        photo.transferTo(uploadPath.resolve(filename));
                        filenames.append(filename).append(",");
                    }
                }
                if (filenames.length() > 0) {
                    filenames.deleteCharAt(filenames.length() - 1);
                    existingReport.setPhotos(filenames.toString());
                }
            } catch (IOException e) {
                response.put("status", "error");
                response.put("message", "Failed to upload photos");
                return response;
            }
        }

        reportService.updateReport(id, existingReport);
        response.put("status", "success");
        response.put("message", "Report updated successfully");
        return response;
    }


    // READ - all reports
    @GetMapping("/")
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    // READ - by citizen
    @GetMapping("/citizen/{citizenId}")
    public List<Report> getReportsByCitizen(@PathVariable Long citizenId) {
        return reportService.getReportsByCitizenId(citizenId);
    }
    @GetMapping("/uploads/reports/{filename:.+}")
    public ResponseEntity<Resource> getReportPhoto(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get("uploads/reports").resolve(filename).normalize();

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .header("Content-Type", Files.probeContentType(filePath))
                .body(resource);
    }


    // READ - single report
    @GetMapping("/{id}")
    public Report getReportById(@PathVariable Long id) {
        return reportService.getReportById(id);
    }

    // DELETE - remove report
    @DeleteMapping("/{id}")
    public Map<String, String> deleteReport(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        reportService.deleteReport(id);
        response.put("status", "success");
        response.put("message", "Report deleted successfully");
        return response;
    }
}

