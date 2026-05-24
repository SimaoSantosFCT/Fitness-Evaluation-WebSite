package com.magda.model;

import java.time.LocalDate;

public class EvaluationResult {
    private Long savedId;
    private String clientSummary;
    private LocalDate evaluationDate;
    private String evaluationType;

    // Resultados avaliação
    private String fatMassEvaluation;
    private String fatMassStatus;
    private String visceralFatEvaluation;
    private String visceralFatStatus;
    private String imcEvaluation;
    private String imcStatus;
    private double imcValue;
    private String waterEvaluation;
    private String waterStatus;
    private String boneMassEvaluation;
    private String physicalLevelEvaluation;
    private String remainingInformation;

    // Calculados Online (US Navy)
    private double calculatedFatMassPercent;
    private double calculatedFatMassKg;
    private double calculatedLeanMassKg;
    private double calculatedBasalMetabolism;
    private String visceralRiskLabel;   // "baixo" | "moderado" | "elevado"
    private double whtr;                // waist-to-height ratio

    public Long getSavedId()                            { return savedId; }
    public void setSavedId(Long v)                      { this.savedId = v; }
    public String getClientSummary()                    { return clientSummary; }
    public void setClientSummary(String v)              { this.clientSummary = v; }
    public LocalDate getEvaluationDate()                { return evaluationDate; }
    public void setEvaluationDate(LocalDate v)          { this.evaluationDate = v; }
    public String getEvaluationType()                   { return evaluationType; }
    public void setEvaluationType(String v)             { this.evaluationType = v; }
    public String getFatMassEvaluation()                { return fatMassEvaluation; }
    public void setFatMassEvaluation(String v)          { this.fatMassEvaluation = v; }
    public String getFatMassStatus()                    { return fatMassStatus; }
    public void setFatMassStatus(String v)              { this.fatMassStatus = v; }
    public String getVisceralFatEvaluation()            { return visceralFatEvaluation; }
    public void setVisceralFatEvaluation(String v)      { this.visceralFatEvaluation = v; }
    public String getVisceralFatStatus()                { return visceralFatStatus; }
    public void setVisceralFatStatus(String v)          { this.visceralFatStatus = v; }
    public String getImcEvaluation()                    { return imcEvaluation; }
    public void setImcEvaluation(String v)              { this.imcEvaluation = v; }
    public String getImcStatus()                        { return imcStatus; }
    public void setImcStatus(String v)                  { this.imcStatus = v; }
    public double getImcValue()                         { return imcValue; }
    public void setImcValue(double v)                   { this.imcValue = v; }
    public String getWaterEvaluation()                  { return waterEvaluation; }
    public void setWaterEvaluation(String v)            { this.waterEvaluation = v; }
    public String getWaterStatus()                      { return waterStatus; }
    public void setWaterStatus(String v)                { this.waterStatus = v; }
    public String getBoneMassEvaluation()               { return boneMassEvaluation; }
    public void setBoneMassEvaluation(String v)         { this.boneMassEvaluation = v; }
    public String getPhysicalLevelEvaluation()          { return physicalLevelEvaluation; }
    public void setPhysicalLevelEvaluation(String v)    { this.physicalLevelEvaluation = v; }
    public String getRemainingInformation()             { return remainingInformation; }
    public void setRemainingInformation(String v)       { this.remainingInformation = v; }
    public double getCalculatedFatMassPercent()         { return calculatedFatMassPercent; }
    public void setCalculatedFatMassPercent(double v)   { this.calculatedFatMassPercent = v; }
    public double getCalculatedFatMassKg()              { return calculatedFatMassKg; }
    public void setCalculatedFatMassKg(double v)        { this.calculatedFatMassKg = v; }
    public double getCalculatedLeanMassKg()             { return calculatedLeanMassKg; }
    public void setCalculatedLeanMassKg(double v)       { this.calculatedLeanMassKg = v; }
    public double getCalculatedBasalMetabolism()        { return calculatedBasalMetabolism; }
    public void setCalculatedBasalMetabolism(double v)  { this.calculatedBasalMetabolism = v; }
    public String getVisceralRiskLabel()                { return visceralRiskLabel; }
    public void setVisceralRiskLabel(String v)          { this.visceralRiskLabel = v; }
    public double getWhtr()                             { return whtr; }
    public void setWhtr(double v)                       { this.whtr = v; }
}