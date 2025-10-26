package com.cityfix.cityfix_backend.repository;

import com.cityfix.cityfix_backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByReportId(Long reportId);
}
