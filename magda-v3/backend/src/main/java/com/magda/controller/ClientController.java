package com.magda.controller;

import com.magda.model.ClientRequest;
import com.magda.model.Evaluation;
import com.magda.model.EvaluationResult;
import com.magda.repository.EvaluationRepository;
import com.magda.service.EvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ClientController {

    private final EvaluationService service;
    private final EvaluationRepository repo;

    public ClientController(EvaluationService service, EvaluationRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    // ── Avaliar e guardar ────────────────────────────────────────────────────
    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResult> evaluate(@RequestBody ClientRequest client) {
        return ResponseEntity.ok(service.evaluateAndSave(client));
    }

    // ── Histórico de um cliente ──────────────────────────────────────────────
    @GetMapping("/history/{clientName}")
    public ResponseEntity<List<Evaluation>> history(@PathVariable String clientName) {
        return ResponseEntity.ok(
            repo.findByClientNameIgnoreCaseOrderByEvaluationDateAsc(clientName)
        );
    }

    // ── Lista de clientes (para dropdown) ────────────────────────────────────
    @GetMapping("/clients")
    public ResponseEntity<List<String>> clients() {
        return ResponseEntity.ok(repo.findDistinctClientNames());
    }

    // ── Apagar avaliação ─────────────────────────────────────────────────────
    @DeleteMapping("/evaluation/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Health check ─────────────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("API Avaliações Magda Santos v2 — Online");
    }
}
