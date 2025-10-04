package com.cityfix.cityfix_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    @JsonIgnoreProperties({"password", "nic", "phone", "address","dob"})
    private Citizen citizen;


    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String locationNotes;

    @Column(nullable = false)
    private String problemCategory;

    @Column(nullable = false)
    private String problemTitle;

    @Column(nullable = false, columnDefinition = "CLOB")
    private String problemDescription;

    private String photos; // comma-separated filenames

    @Column(nullable = false)
    private LocalDate submittedDate;

    public Report() {}

    // =================== GETTERS ===================
    public Long getId() { return id; }

    public Citizen getCitizen() { return citizen; }

    public Double getLatitude() { return latitude; }

    public Double getLongitude() { return longitude; }

    public String getLocationNotes() { return locationNotes; }

    public String getProblemCategory() { return problemCategory; }

    public String getProblemTitle() { return problemTitle; }

    public String getProblemDescription() { return problemDescription; }

    public String getPhotos() { return photos; }

    public LocalDate getSubmittedDate() { return submittedDate; }

    // Add these two fields inside the Report class
    @Column(name = "publicize_issue", nullable = false)
    private Integer publicizeIssue = 0; // 0 = No, 1 = Yes

    @Column(name = "show_name", nullable = false)
    private Integer showName = 0; // 0 = No, 1 = Yes


    public Integer getPublicizeIssue() { return publicizeIssue; }
    public Integer getShowName() { return showName; }




    // =================== SETTERS ===================
    public void setId(Long id) { this.id = id; }

    public void setCitizen(Citizen citizen) { this.citizen = citizen; }

    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public void setLocationNotes(String locationNotes) { this.locationNotes = locationNotes; }

    public void setProblemCategory(String problemCategory) { this.problemCategory = problemCategory; }

    public void setProblemTitle(String problemTitle) { this.problemTitle = problemTitle; }

    public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }

    public void setPhotos(String photos) { this.photos = photos; }

    public void setSubmittedDate(LocalDate submittedDate) { this.submittedDate = submittedDate; }

    public void setPublicizeIssue(Integer publicizeIssue) { this.publicizeIssue = publicizeIssue; }
    public void setShowName(Integer showName) { this.showName = showName; }
}
