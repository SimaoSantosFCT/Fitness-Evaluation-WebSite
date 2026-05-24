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

    public EvaluationResult evaluateAndSave(ClientRequest c) {
        boolean isOnline = "ONLINE".equalsIgnoreCase(c.getEvaluationType());

        // Para avaliação online, calcular valores em falta antes de avaliar
        if (isOnline) calculateOnlineMetrics(c);

        EvaluationResult result = isOnline ? evaluateOnline(c) : evaluatePresencial(c);

        // Guardar na BD
        Evaluation entity = buildEntity(c, result);
        Evaluation saved = repo.save(entity);
        result.setSavedId(saved.getId());
        result.setEvaluationDate(saved.getEvaluationDate());
        result.setEvaluationType(saved.getEvaluationType());

        return result;
    }

    // ── Cálculos Online (US Navy) ─────────────────────────────────────────────

    private void calculateOnlineMetrics(ClientRequest c) {
        boolean female = c.getGenre().equalsIgnoreCase("F");
        double h = c.getHeightCm();   // cm
        double w = c.getWaist();
        double n = c.getNeck();
        double hip = c.getHip();

        // % Gordura Corporal — Fórmula US Navy
        double fatPct;
        if (female) {
            fatPct = 163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387;
        } else {
            fatPct = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
        }
        fatPct = Math.max(3, Math.min(60, round1(fatPct)));
        c.setFatMass(fatPct);

        // Massa Gorda e Massa Magra
        double fatKg  = round1(c.getPeso() * fatPct / 100.0);
        double leanKg = round1(c.getPeso() - fatKg);
        c.setMuscleMass(leanKg);

        // TMB — Mifflin-St Jeor (altura em cm, peso em kg)
        double tmb;
        if (female) {
            tmb = 10 * c.getPeso() + 6.25 * h - 5 * c.getAge() - 161;
        } else {
            tmb = 10 * c.getPeso() + 6.25 * h - 5 * c.getAge() + 5;
        }
        c.setBasalMetabolism(round1(tmb));

        // Gordura visceral via WHtR
        double whtr = w / h;
        double visceralEstimate;
        if (whtr < 0.50)       visceralEstimate = 3;
        else if (whtr < 0.60)  visceralEstimate = 8;
        else                   visceralEstimate = 14;
        c.setVisceralFat(visceralEstimate);

        // Idade metabólica estimada (TMB vs. média para a idade)
        double avgTmb = female
                ? 10 * 65 + 6.25 * h - 5 * c.getAge() - 161
                : 10 * 75 + 6.25 * h - 5 * c.getAge() + 5;
        double metAge = c.getAge() + (avgTmb - tmb) / 15.0;
        c.setMetabolicAge(round1(Math.max(10, metAge)));

        // Altura em metros para IMC
        c.setHeight(h / 100.0);
    }

    // ── Avaliação Online ──────────────────────────────────────────────────────

    private EvaluationResult evaluateOnline(ClientRequest c) {
        EvaluationResult r = new EvaluationResult();
        r.setEvaluationType("ONLINE");
        r.setClientSummary(c.getName() + " | " + c.getAge() + " anos | " +
                c.getHeightCm() + " cm | " + c.getPeso() + " kg");

        evaluateFatMass(c, r);
        evaluateVisceralFat(c, r);
        evaluateIMC(c, r);

        // Cálculos derivados para mostrar nos resultados
        double fatPct = c.getFatMass();
        double fatKg  = round1(c.getPeso() * fatPct / 100.0);
        double leanKg = round1(c.getPeso() - fatKg);
        double whtr   = round2(c.getWaist() / c.getHeightCm());

        r.setCalculatedFatMassPercent(fatPct);
        r.setCalculatedFatMassKg(fatKg);
        r.setCalculatedLeanMassKg(leanKg);
        r.setCalculatedBasalMetabolism(c.getBasalMetabolism());
        r.setWhtr(whtr);

        String riskLabel;
        if (whtr < 0.50)       riskLabel = "Baixo";
        else if (whtr < 0.60)  riskLabel = "Moderado";
        else                   riskLabel = "Elevado";
        r.setVisceralRiskLabel(riskLabel);

        r.setRemainingInformation(
                "Massa Gorda: " + fatKg + " kg  |  " +
                        "Massa Magra: " + leanKg + " kg  |  " +
                        "IMB (Mifflin): " + c.getBasalMetabolism() + " Kcal  |  " +
                        "Idade Metabólica estimada: " + c.getMetabolicAge() + " anos"
        );
        return r;
    }

    // ── Avaliação Presencial ──────────────────────────────────────────────────

    private EvaluationResult evaluatePresencial(ClientRequest c) {
        EvaluationResult r = new EvaluationResult();
        r.setEvaluationType("PRESENCIAL");
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

    // ── Entidade BD ───────────────────────────────────────────────────────────

    private Evaluation buildEntity(ClientRequest c, EvaluationResult r) {
        Evaluation e = new Evaluation();
        e.setClientName(c.getName());
        e.setEvaluationDate(c.getEvaluationDate() != null ? c.getEvaluationDate() : LocalDate.now());
        e.setAge(c.getAge());
        e.setGenre(c.getGenre());
        e.setEvaluationType(r.getEvaluationType());
        e.setWeight(c.getPeso());
        e.setFatMass(c.getFatMass());
        e.setMuscleMass(c.getMuscleMass());
        e.setVisceralFat(c.getVisceralFat());
        e.setBasalMetabolism(c.getBasalMetabolism());
        e.setMetabolicAge(c.getMetabolicAge());
        e.setImc(round1(c.getIMC()));

        boolean isOnline = "ONLINE".equalsIgnoreCase(c.getEvaluationType());
        if (isOnline) {
            e.setHeightCm(c.getHeightCm());
            e.setHeight(c.getHeightCm() / 100.0);
            e.setWaist(c.getWaist());
            e.setNeck(c.getNeck());
            e.setHip(c.getHip());
            e.setChestPerimeter(c.getChestPerimeter());
            e.setArmPerimeter(c.getArmPerimeter());
            e.setThighPerimeter(c.getThighPerimeter());
        } else {
            e.setHeight(c.getHeight());
            e.setBoneMass(c.getBoneMass());
            e.setWater(c.getWater());
            e.setPhysicalLevel(c.getPhysicalLevel());
        }
        return e;
    }

    // ── Avaliações comuns ─────────────────────────────────────────────────────

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
        double vf = c.getVisceralFat();
        if      (vf <= 4)  { r.setVisceralFatEvaluation(vf + " — Nível saudável (1–4)");   r.setVisceralFatStatus("healthy"); }
        else if (vf <= 8)  { r.setVisceralFatEvaluation(vf + " — Nível médio (5–8)");      r.setVisceralFatStatus("medium"); }
        else if (vf <= 12) { r.setVisceralFatEvaluation(vf + " — Nível elevado (9–12)");   r.setVisceralFatStatus("excessive"); }
        else               { r.setVisceralFatEvaluation(vf + " — Nível alerta (13–59)");   r.setVisceralFatStatus("alert"); }
    }

    private void evaluateIMC(ClientRequest c, EvaluationResult r) {
        double imc = round1(c.getIMC());
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

    private double round1(double v) { return Math.round(v * 10.0) / 10.0; }
    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}