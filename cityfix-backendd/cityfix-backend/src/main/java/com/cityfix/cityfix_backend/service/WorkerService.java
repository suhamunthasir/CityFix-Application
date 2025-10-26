package com.cityfix.cityfix_backend.service;

import com.cityfix.cityfix_backend.entity.Worker;
import com.cityfix.cityfix_backend.repository.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;

    public WorkerService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public Optional<Worker> getWorkerById(Long id) {
        return workerRepository.findById(id);
    }

    public Worker saveWorker(Worker worker) {
        return workerRepository.save(worker);
    }

    public void deleteWorker(Long id) {
        workerRepository.deleteById(id);
    }

    public List<Worker> getWorkersByDepartment(String department) {
        return workerRepository.findByDepartment(department);
    }

    public List<Worker> getWorkersByCity(String city) {
        return workerRepository.findByCity(city);
    }
}
