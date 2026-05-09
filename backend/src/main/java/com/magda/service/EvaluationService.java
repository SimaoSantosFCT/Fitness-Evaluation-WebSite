package com.magda.service;

import com.magda.model.ClientRequest;
import com.magda.model.Evaluation;
import com.magda.model.EvaluationResult;
import com.magda.repository.EvaluationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class EvaluationService {

    private final EvaluationRepository repo;

    public EvaluationService(EvaluationRepository repo) {
        this.repo = repo;
    }

    /**
     * Avalia, guarda na BD e retorna o resultado com o ID gerado.
     */
    public EvaluationResult evaluateAndSave(ClientRequest c) {
        // 1. Calcular avaliação
        EvaluationResult result = evaluate(c);

        // 2. Persistir na BD
        Evaluation entity = new Evaluation();
        entity.setClientName(c.getName());
        entity.setEvaluationDate(c.getEvaluationDate() != null ? c.getEvaluationDate() : LocalDate.now());
        entity.setAge(c.getAge());
        entity.setGenre(c.getGenre());
        entity.setHeight(c.getHeight());
        entity.setWeight(c.getPeso());
        entity.setFatMass(c.getFatMass());
        entity.setBoneMass(c.getBoneMass());
        entity.setWater(c.getWater());
        entity.setMuscleMass(c.getMuscleMass());
        entity.setVisceralFat(c.getVisceralFat());
        entity.setBasalMetabolism(c.getBasalMetabolism());
        entity.setMetabolicAge(c.getMetabolicAge());
        entity.setPhysicalLevel(c.getPhysicalLevel());
        entity.setImc(Math.round(c.getIMC() * 10.0) / 10.0);

        Evaluation saved = repo.save(entity);
        result.setSavedId(saved.getId());
        result.setEvaluationDate(saved.getEvaluationDate());

        return result;
    }

    // ── Lógica de avaliação ──────────────────────────────────────────────────

    private EvaluationResult evaluate(ClientRequest c) {
        EvaluationResult r = new EvaluationResult();
        r.setClientSummary(c.getName() + " | " + c.getAge() + " anos | " +
                           c.getHeight() + " m | " + c.getPeso() + " kg");
        evaluateFatMass(c, r);
        evaluateVisceralFat(c, r);
        evaluateIMC(c, r);
        evaluateWater(c, r);
        evaluateBoneMass(c, r);
        evaluatePhysicalLevel(c, r);
        r.setRemainingInformation(
            "Idade Metabólica: " + c.getMetabolicAge() +
            " anos   |   Massa Muscular: " + c.getMuscleMass() +
            " kg   |   IMB: " + c.getBasalMetabolism() + " Kcal"
        );
        return r;
    }

    private void evaluateFatMass(ClientRequest c, EvaluationResult r) {
        boolean f = c.getGenre().equalsIgnoreCase("F");
        int age = c.getAge();
        double fat = c.getFatMass();
        double low, normalMax, highMax;

        if (f) {
            if (age <= 39)      { low = 20.9; normalMax = 32.9; highMax = 38.9; }
            else if (age <= 59) { low = 22.9; normalMax = 33.9; highMax = 39.9; }
            else                { low = 23.9; normalMax = 35.9; highMax = 41.9; }
        } else {
            if (age <= 39)      { low = 7.9;  normalMax = 19.9; highMax = 24.9; }
            else if (age <= 59) { low = 10.9; normalMax = 21.9; highMax = 27.9; }
            else                { low = 12.9; normalMax = 24.9; highMax = 29.9; }
        }

        String range = (low + 0.1) + "% a " + normalMax + "%";
        if      (fat <= low)       { r.setFatMassEvaluation(fat + "% — Baixa (normal: " + range + ")");          r.setFatMassStatus("low"); }
        else if (fat <= normalMax) { r.setFatMassEvaluation(fat + "% — Normal");                                  r.setFatMassStatus("normal"); }
        else if (fat <= highMax)   { r.setFatMassEvaluation(fat + "% — Elevada (normal: " + range + ")");        r.setFatMassStatus("high"); }
        else                       { r.setFatMassEvaluation(fat + "% — Muito Elevada (normal: " + range + ")");  r.setFatMassStatus("very_high"); }
    }

    private void evaluateVisceralFat(ClientRequest c, EvaluationResult r) {
        if (c.getVisceralFat() < 12) {
            r.setVisceralFatEvaluation(c.getVisceralFat() + " — Nível saudável (< 12)");
            r.setVisceralFatStatus("healthy");
        } else {
            r.setVisceralFatEvaluation(c.getVisceralFat() + " — Nível excessivo (≥ 12)");
            r.setVisceralFatStatus("excessive");
        }
    }

    private void evaluateIMC(ClientRequest c, EvaluationResult r) {
        double imc = Math.round(c.getIMC() * 10.0) / 10.0;
        r.setImcValue(imc);
        String cat, status;
        if      (imc < 18.5) { cat = "Abaixo do peso";   status = "underweight"; }
        else if (imc < 24.9) { cat = "Peso normal";       status = "normal"; }
        else if (imc < 29.9) { cat = "Sobrepeso";         status = "overweight"; }
        else if (imc < 34.9) { cat = "Obesidade grau 1"; status = "obese1"; }
        else if (imc < 39.9) { cat = "Obesidade grau 2"; status = "obese2"; }
        else                  { cat = "Obesidade grau 3"; status = "obese3"; }
        r.setImcEvaluation(imc + " — " + cat + ". " + imcDescription(cat));
        r.setImcStatus(status);
    }

    private String imcDescription(String cat) {
        return switch (cat) {
            case "Abaixo do peso"   -> "Risco de défices nutricionais e fadiga.";
            case "Peso normal"      -> "Associado a boa vitalidade e condição física.";
            case "Sobrepeso"        -> "Pode causar fadiga e problemas cardiovasculares.";
            case "Obesidade grau 1" -> "Risco de diabetes, hipertensão e articulações.";
            case "Obesidade grau 2" -> "Risco elevado cardiovascular, diabetes e cancro.";
            case "Obesidade grau 3" -> "Risco muito elevado. Acompanhamento médico urgente.";
            default -> "";
        };
    }

    private void evaluateWater(ClientRequest c, EvaluationResult r) {
        boolean f = c.getGenre().equalsIgnoreCase("F");
        double min = f ? 45 : 50, max = f ? 60 : 65, w = c.getWater();
        String g = f ? "mulheres" : "homens", range = min + "–" + max + "% para " + g;
        if      (w < min) { r.setWaterEvaluation(w + "% — Abaixo do normal (" + range + ")"); r.setWaterStatus("low"); }
        else if (w > max) { r.setWaterEvaluation(w + "% — Acima do normal (" + range + ")");  r.setWaterStatus("high"); }
        else              { r.setWaterEvaluation(w + "% — Normal (" + range + ")");            r.setWaterStatus("normal"); }
    }

    private void evaluateBoneMass(ClientRequest c, EvaluationResult r) {
        boolean f = c.getGenre().equalsIgnoreCase("F");
        double p = c.getPeso(), b = c.getBoneMass(), ref;
        if (f)  ref = p < 50 ? 1.95 : p < 75 ? 2.40 : 2.95;
        else    ref = p < 65 ? 2.66 : p < 95 ? 3.29 : 3.69;
        if      (b == ref) r.setBoneMassEvaluation(b + " kg — Igual à referência (" + ref + " kg)");
        else if (b <  ref) r.setBoneMassEvaluation(b + " kg — Abaixo da referência (" + ref + " kg)");
        else               r.setBoneMassEvaluation(b + " kg — Acima da referência (" + ref + " kg)");
    }

    private void evaluatePhysicalLevel(ClientRequest c, EvaluationResult r) {
        r.setPhysicalLevelEvaluation(switch (c.getPhysicalLevel()) {
            case 1 -> "Nível 1 — Obesidade Oculta";
            case 2 -> "Nível 2 — Obesidade";
            case 3 -> "Nível 3 — Constituição Sólida";
            case 4 -> "Nível 4 — Falta de Exercício";
            case 5 -> "Nível 5 — Normal";
            case 6 -> "Nível 6 — Musculação Normal";
            case 7 -> "Nível 7 — Magro";
            case 8 -> "Nível 8 — Magro e Musculado";
            case 9 -> "Nível 9 — Muito Musculado";
            default -> "Nível desconhecido";
        });
    }
}
