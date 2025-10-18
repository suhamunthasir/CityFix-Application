package com.cityfix.cityfix_backend.service;

import com.cityfix.cityfix_backend.entity.Announcement;
import com.cityfix.cityfix_backend.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    public Announcement saveAnnouncement(Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Announcement getAnnouncementById(Long id) {
        return announcementRepository.findById(id).orElse(null);
    }

    public Announcement updateAnnouncement(Long id, Announcement updatedAnnouncement) {
        Announcement existing = announcementRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setTitle(updatedAnnouncement.getTitle());
            existing.setContent(updatedAnnouncement.getContent());
            existing.setPriority(updatedAnnouncement.getPriority());
            existing.setImages(updatedAnnouncement.getImages());
            existing.setCategory(updatedAnnouncement.getCategory());
            existing.setCreatedBy(updatedAnnouncement.getCreatedBy());
            // keep original createdDate/time if you want to preserve
            return announcementRepository.save(existing);
        }
        return null;
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
