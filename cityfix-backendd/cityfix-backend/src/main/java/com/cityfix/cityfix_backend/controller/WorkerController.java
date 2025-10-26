package com.cityfix.cityfix_backend.controller;

import com.cityfix.cityfix_backend.entity.Worker;
import com.cityfix.cityfix_backend.service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    // Get all workers
    @GetMapping("/")
    public List<Worker> getAllWorkers() {
        return workerService.getAllWorkers();
    }

    // Get worker by ID
    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        return workerService.getWorkerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new worker
    @PostMapping("/")
    public Worker createWorker(@RequestBody Worker worker) {
        return workerService.saveWorker(worker);
    }

    // Update worker
    @PutMapping("/{id}")
    public ResponseEntity<Worker> updateWorker(@PathVariable Long id, @RequestBody Worker updatedWorker) {
        return workerService.getWorkerById(id).map(worker -> {
            worker.setFullName(updatedWorker.getFullName());
            worker.setEmail(updatedWorker.getEmail());
            worker.setPhoneNumber(updatedWorker.getPhoneNumber());
            worker.setRole(updatedWorker.getRole());
            worker.setDepartment(updatedWorker.getDepartment());
            worker.setCity(updatedWorker.getCity());
            worker.setAddress(updatedWorker.getAddress());
            workerService.saveWorker(worker);
            return ResponseEntity.ok(worker);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete worker
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        if(workerService.getWorkerById(id).isPresent()) {
            workerService.deleteWorker(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get workers by department
    @GetMapping("/department/{dept}")
    public List<Worker> getWorkersByDepartment(@PathVariable String dept) {
        return workerService.getWorkersByDepartment(dept);
    }

    // Get workers by city
    @GetMapping("/city/{city}")
    public List<Worker> getWorkersByCity(@PathVariable String city) {
        return workerService.getWorkersByCity(city);
    }
}
