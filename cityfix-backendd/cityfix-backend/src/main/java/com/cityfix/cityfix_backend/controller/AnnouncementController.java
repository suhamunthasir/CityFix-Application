package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.entity.Announcement;
import com.cityfix.cityfix_backend.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    // ✅ CREATE with image upload
    @PostMapping("/create")
    public Map<String, String> createAnnouncement(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "createdBy", required = false) String createdBy,
            @RequestParam(value = "images", required = false) MultipartFile[] images
    ) {
        Map<String, String> response = new HashMap<>();
        Announcement announcement = new Announcement();

        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setPriority(priority);
        announcement.setCategory(category);
        announcement.setCreatedBy(createdBy);
        announcement.setCreatedDate(LocalDate.now());
        announcement.setCreatedTime(LocalTime.now().toString());

        // Handle image uploads
        if (images != null && images.length > 0) {
            StringBuilder fileNames = new StringBuilder();
            Path uploadPath = Paths.get("uploads/announcements");

            try {
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                        image.transferTo(uploadPath.resolve(fileName));
                        if (fileNames.length() > 0) fileNames.append(",");
                        fileNames.append(fileName);
                    }
                }

                announcement.setImages(fileNames.toString());
            } catch (IOException e) {
                response.put("status", "error");
                response.put("message", "Failed to upload images");
                return response;
            }
        }

        announcementService.saveAnnouncement(announcement);
        response.put("status", "success");
        response.put("message", "Announcement created successfully");
        return response;
    }

    // ✅ UPDATE announcement (with optional image replacement)
    @PutMapping("/{id}")
    public Map<String, String> updateAnnouncement(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "createdBy", required = false) String createdBy,
            @RequestParam(value = "images", required = false) MultipartFile[] images
    ) {
        Map<String, String> response = new HashMap<>();
        Announcement existing = announcementService.getAnnouncementById(id);

        if (existing == null) {
            response.put("status", "error");
            response.put("message", "Announcement not found");
            return response;
        }

        existing.setTitle(title);
        existing.setContent(content);
        existing.setPriority(priority);
        existing.setCategory(category);
        existing.setCreatedBy(createdBy);

        // Handle image upload (append or replace)
        if (images != null && images.length > 0) {
            StringBuilder fileNames = new StringBuilder();
            Path uploadPath = Paths.get("uploads/announcements");

            try {
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                        image.transferTo(uploadPath.resolve(fileName));
                        if (fileNames.length() > 0) fileNames.append(",");
                        fileNames.append(fileName);
                    }
                }

                // Keep old image names if you want to append
                if (existing.getImages() != null && !existing.getImages().isEmpty()) {
                    existing.setImages(existing.getImages() + "," + fileNames);
                } else {
                    existing.setImages(fileNames.toString());
                }

            } catch (IOException e) {
                response.put("status", "error");
                response.put("message", "Failed to upload images");
                return response;
            }
        }

        announcementService.updateAnnouncement(id, existing);
        response.put("status", "success");
        response.put("message", "Announcement updated successfully");
        return response;
    }

    // ✅ READ all
    @GetMapping
    public List<Announcement> getAllAnnouncements() {
        return announcementService.getAllAnnouncements();
    }

    // ✅ READ one
    @GetMapping("/{id}")
    public Announcement getAnnouncementById(@PathVariable Long id) {
        return announcementService.getAnnouncementById(id);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public Map<String, String> deleteAnnouncement(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        announcementService.deleteAnnouncement(id);
        response.put("status", "success");
        response.put("message", "Announcement deleted successfully");
        return response;
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getAnnouncementImage(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get("uploads/announcements").resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .header("Content-Type", Files.probeContentType(filePath))
                .body(resource);
    }


}
