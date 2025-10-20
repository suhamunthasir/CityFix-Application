package com.cityfix.cityfix_backend.service;

import com.cityfix.cityfix_backend.entity.Report;
import com.cityfix.cityfix_backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private ReportRepository repository;

    public Report saveReport(Report report) {
        return repository.save(report);
    }



    public List<Report> getAllReports() {
        entityManager.clear();
        return repository.findAll();
    }

    public Report getReportById(Long id) {
        Optional<Report> opt = repository.findById(id);
        return opt.orElse(null);
    }

    public List<Report> getReportsByCitizenId(Long citizenId) {
        return repository.findByCitizenId(citizenId);
    }

    public void deleteReport(Long id) {
        repository.deleteById(id);
        repository.flush();
    }

    public Report updateReport(Long id, Report updatedReport) {
        Report existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        existing.setLatitude(updatedReport.getLatitude());
        existing.setLongitude(updatedReport.getLongitude());
        existing.setLocationNotes(updatedReport.getLocationNotes());
        existing.setProblemCategory(updatedReport.getProblemCategory());
        existing.setProblemTitle(updatedReport.getProblemTitle());
        existing.setProblemDescription(updatedReport.getProblemDescription());

        if (updatedReport.getPhotos() != null) {
            existing.setPhotos(updatedReport.getPhotos());
        }

        if (updatedReport.getStatus() != null) {
            existing.setStatus(updatedReport.getStatus());
        }

        return repository.save(existing);
    }
}
