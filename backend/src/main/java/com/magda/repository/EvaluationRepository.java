package com.magda.repository;

import com.magda.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    // Todas as avaliações de um cliente, ordenadas por data
    List<Evaluation> findByClientNameIgnoreCaseOrderByEvaluationDateAsc(String clientName);

    // Lista de nomes únicos (para o dropdown de pesquisa)
    @Query("SELECT DISTINCT e.clientName FROM Evaluation e ORDER BY e.clientName ASC")
    List<String> findDistinctClientNames();
}
