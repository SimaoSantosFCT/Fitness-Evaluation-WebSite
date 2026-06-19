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
        if (isOnline) calculateOnlineMetrics(c);

        EvaluationResult result = isOnline ? evaluateOnline(c) : evaluatePresencial(c);

        Evaluation entity = buildEntity(c, result);
        Evaluation saved = repo.save(entity);
        result.setSavedId(saved.getId());
        result.setEvaluationDate(saved.getEvaluationDate());
        result.setEvaluationType(saved.getEvaluationType());
        return result;
    }

    private void calculateOnlineMetrics(ClientRequest c) {
        boolean female = c.getGenre().equalsIgnoreCase("F");
        double h   = c.getHeightCm();
        double w   = c.getWaist();
        double n   = c.getNeck();
        double hip = c.getHip();
        double peso = c.getPeso();
        int    age  = c.getAge();
        double heightMeters = h / 100.0;
        c.setHeight(heightMeters);

        // ── % Gordura (Fórmula Marinha Americana) ──────────────────────────────
        double fatPct;
        if (female) {
            fatPct = 163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387;
        } else {
            fatPct = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
        }
        fatPct = Math.max(3, Math.min(60, round1(fatPct)));
        c.setFatMass(fatPct);

        // ── Massas ────────────────────────────────────────────────────────────
        double fatKg  = round1(peso * fatPct / 100.0);
        double leanKg = round1(peso - fatKg);
        c.setMuscleMass(leanKg);

        // ── TMB — Mifflin-St Jeor ─────────────────────────────────────────────
        double tmb = female
                ? 10 * peso + 6.25 * h - 5 * age - 161
                : 10 * peso + 6.25 * h - 5 * age + 5;
        tmb = round1(tmb);
        c.setBasalMetabolism(tmb);

        // ── TDEE — Fator de atividade ───────────────────────────────────────
        String al = c.getActivityLevel() != null ? c.getActivityLevel() : "SEDENTARIO";
        double factor = switch (al) {
            case "LEVEMENTE_ATIVO"       -> 1.375;
            case "MODERADAMENTE_ATIVO"   -> 1.55;
            case "MUITO_ATIVO"           -> 1.725;
            case "SUPER_ATIVO"           -> 1.9;
            default                      -> 1.2; // SEDENTARIO
        };
        double tdee = round1(tmb * factor);

        double avgTmb = female
                ? 10 * 65 + 6.25 * h - 5 * age - 161
                : 10 * 75 + 6.25 * h - 5 * age + 5;
        double metAge = round1(Math.max(10, age + (avgTmb - tmb) / 15.0));
        c.setMetabolicAge(metAge);

        // ── Gordura visceral ───────────────────────────────────────────
        double whtr = w / h;
        c.setVisceralFat(whtr < 0.50 ? 3 : whtr < 0.60 ? 8 : 14);

        // ── Água corporal ────────────────────────────────────────────
        double waterL = female
                ? -2.097 + 0.1069 * h + 0.2466 * peso
                : 2.447 - 0.09156 * age + 0.1074 * h + 0.3362 * peso;
        double waterPct = round1((waterL / peso) * 100.0);
        c.setWater(waterPct);
    }

    // ── Resultado Online ─────────────────────────────────────────────

    private EvaluationResult evaluateOnline(ClientRequest c) {
        EvaluationResult r = new EvaluationResult();
        r.setEvaluationType("ONLINE");
        r.setClientSummary(c.getName() + " | " + c.getAge() + " anos | " +
                c.getHeightCm() + " cm | " + c.getPeso() + " kg");
        evaluateFatMass(c, r);
        evaluateVisceralFat(c, r);
        evaluateIMC(c, r);

        boolean female = c.getGenre().equalsIgnoreCase("F");
        double peso    = c.getPeso();
        double fatPct  = c.getFatMass();
        double fatKg   = round1(peso * fatPct / 100.0);
        double leanKg  = round1(peso - fatKg);
        double tmb     = c.getBasalMetabolism();

        String al = c.getActivityLevel() != null ? c.getActivityLevel() : "SEDENTARIO";
        double factor = switch (al) {
            case "LEVEMENTE_ATIVO"       -> 1.375;
            case "MODERADAMENTE_ATIVO"   -> 1.55;
            case "MUITO_ATIVO"           -> 1.725;
            case "SUPER_ATIVO"           -> 1.9;
            default                      -> 1.2;
        };
        double tdee    = round1(tmb * factor);
        double whtr    = round2(c.getWaist() / c.getHeightCm());
        double waterPct = c.getWater();
        double metAge   = c.getMetabolicAge();

        // Peso ideal — Devine ajustado pelo tipo de corpo
        String frame    = c.getBodyFrame() != null ? c.getBodyFrame() : "NORMAL";
        double frameAdj = frame.equals("PEQUENO") ? -0.1 : frame.equals("GRANDE") ? 0.1 : 0.0;
        double idealBase = female
                ? 45.5 + 2.3 * ((c.getHeightCm() - 152.4) / 2.54)
                : 50.0 + 2.3 * ((c.getHeightCm() - 152.4) / 2.54);
        double idealWeight    = round1(idealBase * (1 + frameAdj));
        double idealWeightMin = round1(idealWeight * 0.95);
        double idealWeightMax = round1(idealWeight * 1.15);

        // Zona de água
        String waterZone;
        if (female) {
            waterZone = waterPct < 45 ? "baixo" : waterPct < 50 ? "saudavel" : waterPct < 60 ? "alto" : "muito_alto";
        } else {
            waterZone = waterPct < 50 ? "baixo" : waterPct < 55 ? "saudavel" : waterPct < 65 ? "alto" : "muito_alto";
        }

        // Zona % gordura
        String fatZone;
        int age = c.getAge();
        if (female) {
            double[] refs = age <= 39 ? new double[]{21, 32.9, 38.9} : age <= 59 ? new double[]{23, 33.9, 39.9} : new double[]{24, 35.9, 41.9};
            fatZone = fatPct < refs[0] ? "baixo" : fatPct <= refs[1] ? "bom" : fatPct <= refs[2] ? "normal" : "elevado";
        } else {
            double[] refs = age <= 39 ? new double[]{8, 19.9, 24.9} : age <= 59 ? new double[]{11, 21.9, 27.9} : new double[]{13, 24.9, 29.9};
            fatZone = fatPct < refs[0] ? "baixo" : fatPct <= refs[1] ? "bom" : fatPct <= refs[2] ? "normal" : "elevado";
        }

        // Zona massa muscular (% do peso)
        double musclePct = (leanKg / peso) * 100.0;
        String muscleZone;
        if (female) {
            muscleZone = musclePct < 24 ? "baixo" : musclePct < 30 ? "saudavel" : musclePct < 35 ? "bom" : "excelente";
        } else {
            muscleZone = musclePct < 33 ? "baixo" : musclePct < 39 ? "saudavel" : musclePct < 44 ? "bom" : "excelente";
        }

        // Labels actividade e tipo de corpo
        String actLabel = switch (al) {
            case "LEVEMENTE_ATIVO"     -> "Levemente Ativo";
            case "MODERADAMENTE_ATIVO" -> "Moderadamente Ativo";
            case "MUITO_ATIVO"         -> "Muito Ativo";
            case "SUPER_ATIVO"         -> "Super Ativo";
            default                    -> "Sedentário";
        };
        String frameLabel = switch (frame) {
            case "PEQUENO" -> "Pequeno";
            case "GRANDE"  -> "Grande";
            default        -> "Normal";
        };

        // Risco visceral
        String riskLabel = whtr < 0.50 ? "Baixo" : whtr < 0.60 ? "Moderado" : "Elevado";

        r.setCalculatedFatMassPercent(fatPct);
        r.setCalculatedFatMassKg(fatKg);
        r.setCalculatedLeanMassKg(leanKg);
        r.setCalculatedBasalMetabolism(tmb);
        r.setCalculatedTDEE(tdee);
        r.setCalculatedWaterPercent(waterPct);
        r.setCalculatedIdealWeight(idealWeight);
        r.setCalculatedIdealWeightMin(idealWeightMin);
        r.setCalculatedIdealWeightMax(idealWeightMax);
        r.setCalculatedMetabolicAge(metAge);
        r.setWhtr(whtr);
        r.setVisceralRiskLabel(riskLabel);
        r.setActivityLevelLabel(actLabel);
        r.setBodyFrameLabel(frameLabel);
        r.setWaterZone(waterZone);
        r.setFatMassZone(fatZone);
        r.setMuscleMassZone(muscleZone);

        r.setRemainingInformation(
                "Massa Gorda: " + fatKg + " kg  |  " +
                        "Massa Magra: " + leanKg + " kg  |  " +
                        "IMB: " + tmb + " Kcal  |  " +
                        "TDEE: " + tdee + " Kcal  |  " +
                        "Idade Metabólica: " + metAge + " anos"
        );
        return r;
    }



    // ── Resultado Presencial ──────────────────────────────────────────────────

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
            e.setWater(c.getWater());
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
        else               { r.setVisceralFatEvaluation(vf + " — Nível alerta (> 12)");    r.setVisceralFatStatus("alert"); }
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
        r.setImcEvaluation(imc + " — " + cat);
        r.setImcStatus(status);
    }

    private void evaluateWater(ClientRequest c, EvaluationResult r) {
        boolean f = c.getGenre().equalsIgnoreCase("F");
        double min = f ? 45 : 50, max = f ? 60 : 65, w = c.getWater();
        String g = f ? "mulheres" : "homens";
        if      (w < min) { r.setWaterEvaluation(w + "% — Abaixo do normal (" + min + "–" + max + "% para " + g + ")"); r.setWaterStatus("low"); }
        else if (w > max) { r.setWaterEvaluation(w + "% — Acima do normal (" + min + "–" + max + "% para " + g + ")");  r.setWaterStatus("high"); }
        else              { r.setWaterEvaluation(w + "% — Normal (" + min + "–" + max + "% para " + g + ")");            r.setWaterStatus("normal"); }
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