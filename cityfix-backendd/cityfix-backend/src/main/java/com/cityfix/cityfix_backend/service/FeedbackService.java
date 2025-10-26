package com.cityfix.cityfix_backend.service;

import com.cityfix.cityfix_backend.entity.Feedback;
import com.cityfix.cityfix_backend.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    public Feedback addFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    public List<Feedback> getFeedbackByReportId(Long reportId) {
        return feedbackRepository.findByReportId(reportId);
    }

    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id).orElse(null);
    }

    public Feedback updateFeedback(Long id, Feedback updatedFeedback) {
        return feedbackRepository.findById(id).map(f -> {
            f.setFeedback(updatedFeedback.getFeedback());
            f.setReportId(updatedFeedback.getReportId());
            return feedbackRepository.save(f);
        }).orElse(null);
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}
