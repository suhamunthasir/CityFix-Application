package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.entity.Report;
import com.cityfix.cityfix_backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ReportService reportService;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        try {
            if (request == null || request.getCitizenId() == null || request.getMessage() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing citizenId or message"));
            }

            Long citizenId = request.getCitizenId();
            String userMessage = request.getMessage().trim();

            // fetch reports for citizen
            List<Report> reports = reportService.getReportsByCitizenId(citizenId);

            // prepare a concise summary to send as context to the model
            String reportSummary = buildReportSummary(reports);

            // Build system + user messages for /v1/chat/completions
            String systemPrompt = "You are CityFix Assistant, a helpful and concise assistant for a municipal issue reporting system (CityFix Sri Lanka). "
                    + "Use only the factual report summary provided. If user asks something you cannot answer from the summary, say you don't have that data and guide them how to view it on the site.";

            String userPrompt = "Here is the user's request: \"" + userMessage + "\"\n\n"
                    + "Report Summary:\n" + reportSummary + "\n\n"
                    + "Answer clearly and concisely. If the user asks for a specific report id, include the id and available fields (title, status, submittedDate, description). "
                    + "If there are no reports, say so. Keep results short and user-friendly.";

            // Compose body for OpenAI Chat Completions API
            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-3.5-turbo"); // change to gpt-4 or gpt-4o if you have access & want better quality
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));
            body.put("messages", messages);
            body.put("temperature", 0.35);
            body.put("max_tokens", 600);

            // Call OpenAI
            String apiUrl = "https://api.openai.com/v1/chat/completions";
            RestTemplate rt = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(openAiApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String,Object>> entity = new HttpEntity<>(body, headers);
            Map<String,Object> aiResponse = rt.postForObject(apiUrl, entity, Map.class);

            if (aiResponse == null || !aiResponse.containsKey("choices")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "No response from OpenAI"));
            }

            List<Map<String,Object>> choices = (List<Map<String,Object>>) aiResponse.get("choices");
            if (choices.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "OpenAI returned no choices"));
            }

            Map<String,Object> firstChoice = choices.get(0);
            Map<String,Object> messageObj = (Map<String,Object>) firstChoice.get("message");
            String assistantReply = messageObj != null && messageObj.get("content") != null ? messageObj.get("content").toString().trim() : "Sorry, I couldn't generate a response.";

            // return to frontend
            return ResponseEntity.ok(Map.of("reply", assistantReply));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Chatbot failed: " + ex.getMessage()));
        }
    }

    private String buildReportSummary(List<Report> reports) {
        if (reports == null || reports.isEmpty()) {
            return "No reports found for this citizen.";
        }

        // Keep summary concise: limit to most recent 12 reports to avoid huge prompts
        List<Report> sorted = reports.stream()
                .sorted(Comparator.comparing(Report::getSubmittedDate).reversed())
                .limit(12)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        for (Report r : sorted) {
            String submitted = r.getSubmittedDate() != null ? r.getSubmittedDate().format(DATE_FMT) : "N/A";
            String photos = r.getPhotos() != null ? "[photos]" : "[no photos]";
            String desc = r.getProblemDescription() != null ? sanitizeForPrompt(r.getProblemDescription(), 150) : "";
            sb.append("ID: ").append(r.getId())
                    .append(" | Title: ").append(nullSafe(r.getProblemTitle()))
                    .append(" | Status: ").append(nullSafe(r.getStatus()))
                    .append(" | Submitted: ").append(submitted)
                    .append(" | Category: ").append(nullSafe(r.getProblemCategory()))
                    .append(" | Desc: ").append(desc)
                    .append(" | Photos: ").append(photos)
                    .append(". ");
        }
        return sb.toString();
    }

    private String nullSafe(String v) {
        return v == null ? "N/A" : v.replaceAll("\\s+", " ").trim();
    }

    private String sanitizeForPrompt(String text, int maxChars) {
        if (text == null) return "";
        String single = text.replaceAll("\\s+", " ").trim();
        if (single.length() <= maxChars) return single;
        return single.substring(0, maxChars-3) + "...";
    }
}
